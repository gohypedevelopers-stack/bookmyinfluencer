'use server';

import { db } from "@/lib/db";
import { UserRole } from "@/lib/enums";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";

import { sendOtpEmail } from "@/lib/email";
import { createBrandCampaignWorkflow } from "@/services/collabService";
import { FOLLOWER_RANGE_PREFIX, ensureCampaignSuggestions } from "@/lib/campaign-flow";
import { ensureRequestExpiryJobStarted } from "@/jobs/requestExpiryJob";
import { hashOtp, constantTimeEqualHex } from "@/lib/otp";



function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email: string) {
    return String(email || '').trim().toLowerCase();
}

function safeParseInt(value: FormDataEntryValue | null) {
    if (!value || typeof value !== 'string') return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function safeParseFloat(value: FormDataEntryValue | null) {
    if (!value || typeof value !== 'string') return null;
    const normalized = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? null : parsed;
}

function isDatabaseConnectionError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return error.code === "P1000" || error.code === "P1001" || error.code === "P1002" || error.code === "P1017";
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        return true;
    }

    const message = error instanceof Error ? error.message : String(error);
    return /can't reach database server|connection|timed out|econnreset|socket hang up/i.test(message);
}

async function findExistingAccountByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
        return null;
    }

    const existingUser = await db.user.findUnique({
        where: {
            email: normalizedEmail,
        },
        select: {
            id: true,
            email: true,
            role: true,
        },
    });

    if (existingUser) {
        return {
            source: 'user',
            role: existingUser.role,
            email: existingUser.email,
            id: existingUser.id,
        };
    }

    const otpUser = await db.otpUser.findUnique({
        where: {
            email: normalizedEmail,
        },
        include: {
            creator: true,
        },
    });

    if (otpUser && otpUser.creator) {
        return {
            source: 'otp_user',
            role: 'INFLUENCER',
            email: otpUser.email,
            id: otpUser.id,
        };
    }

    return null;
}

function getBrandAccountConflictMessage(existingAccount: { role: string }) {
    switch (existingAccount.role) {
        case 'BRAND':
            return 'A brand account with this email already exists. Please sign in instead.';
        case 'ADMIN':
            return 'This email is already linked to an admin account. Use a different business email for your brand.';
        case 'MANAGER':
            return 'This email is already linked to a manager account. Use a different business email for your brand.';
        case 'INFLUENCER':
        default:
            return 'This email is already linked to an influencer account. Use creator sign in or a different business email for your brand.';
    }
}

export async function ensureDevBrandSimulationAccount() {
    if (process.env.NODE_ENV === 'production') {
        return {
            success: false,
            error: 'Brand Google login simulation is only available in local development.',
        };
    }

    const email = normalizeEmail('brand@nike.com');
    const password = 'password123';

    try {
        const existingAccount = await findExistingAccountByEmail(email);
        if (existingAccount && existingAccount.role !== UserRole.BRAND) {
            return {
                success: false,
                error: getBrandAccountConflictMessage(existingAccount),
            };
        }

        const passwordHash = await hash(password, 12);
        const user = await db.user.upsert({
            where: { email },
            update: {
                name: 'Nike Brand Manager',
                passwordHash,
                role: UserRole.BRAND,
            },
            create: {
                email,
                name: 'Nike Brand Manager',
                passwordHash,
                role: UserRole.BRAND,
            },
            select: { id: true },
        });

        const brandProfile = await db.brandProfile.upsert({
            where: { userId: user.id },
            update: {
                companyName: 'Nike',
                website: 'https://nike.com',
                industry: 'Sportswear',
                description: 'Development simulation brand account.',
                location: 'India',
                onboardingCompleted: true,
            },
            create: {
                userId: user.id,
                companyName: 'Nike',
                website: 'https://nike.com',
                industry: 'Sportswear',
                description: 'Development simulation brand account.',
                location: 'India',
                onboardingCompleted: true,
            },
            select: { id: true },
        });

        await db.brandWallet.upsert({
            where: { brandId: brandProfile.id },
            update: {},
            create: {
                brandId: brandProfile.id,
                balance: 0,
                currency: 'INR',
            },
        });

        return {
            success: true,
            email,
            password,
        };
    } catch (err) {
        console.error('[Brand Login Simulation] Failed to prepare dev account:', err);
        return {
            success: false,
            error: 'Failed to prepare the local brand simulation account. Check your database connection.',
        };
    }
}

export async function inspectBrandLoginEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return {
            exists: false,
            canUseBrandLogin: false,
            role: null,
            message: 'Enter a valid business email address.',
        };
    }

    const existingAccount = await findExistingAccountByEmail(normalizedEmail);
    if (!existingAccount) {
        return {
            exists: false,
            canUseBrandLogin: false,
            role: null,
            message: 'No brand account found for this email. Create a brand account first.',
        };
    }

    if (existingAccount.role === 'BRAND' || existingAccount.role === 'ADMIN') {
        return {
            exists: true,
            canUseBrandLogin: true,
            role: existingAccount.role,
            message: 'Incorrect password. Please try again.',
        };
    }

    return {
        exists: true,
        canUseBrandLogin: false,
        role: existingAccount.role,
        message: getBrandAccountConflictMessage(existingAccount),
    };
}

export async function sendEmailOtp(email: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return { success: false, error: 'Invalid email address.' };
    }

    try {
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpHash = hashOtp(normalizedEmail, otp);

        const otpUser = await db.otpUser.upsert({
            where: { email: normalizedEmail },
            update: {},
            create: { email: normalizedEmail },
            select: { id: true }
        });

        await db.emailOtp.upsert({
            where: { userId: otpUser.id },
            update: { otpHash, expiresAt, attempts: 0, lastSentAt: new Date() },
            create: { userId: otpUser.id, otpHash, expiresAt, attempts: 0, lastSentAt: new Date() },
        });

        const emailResult = await sendOtpEmail(normalizedEmail, otp);
        if (!emailResult.success) {
            console.log(`\n┌────────────────────────────────────────────────────────┐`);
            console.log(`│                  [DEVELOPMENT OTP BYPASS]              │`);
            console.log(`├────────────────────────────────────────────────────────┤`);
            console.log(`│  Email: ${normalizedEmail.padEnd(46)} │`);
            console.log(`│  OTP:   ${otp.padEnd(46)} │`);
            console.log(`├────────────────────────────────────────────────────────┤`);
            console.log(`│  SMTP error occurred: ${String(emailResult.error || 'Unknown').substring(0, 31).padEnd(31)} │`);
            console.log(`└────────────────────────────────────────────────────────┘\n`);

            if (process.env.NODE_ENV !== 'production') {
                return {
                    success: true,
                    message: 'OTP has been generated. Since you are in local development, please use the OTP code printed in your server terminal/console.',
                    devOtpAvailable: true,
                };
            }

            return {
                success: false,
                error: emailResult.error || 'Failed to send OTP email.',
                devOtpAvailable: false,
            };
        }

        return { success: true, message: 'OTP sent to your email.' };
    } catch (err) {
        console.error('[Brand OTP] sendEmailOtp failed:', err);
        if (isDatabaseConnectionError(err)) {
            return {
                success: false,
                error: 'Database connection failed. Check DATABASE_URL/DIRECT_URL credentials and restart the server.',
            };
        }
        return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
}

export async function verifyEmailOtp(email: string, otp: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
        return { success: false, error: 'Email and OTP are required.' };
    }

    const otpUser = await db.otpUser.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
    });

    if (!otpUser) {
        return { success: false, error: 'Please click "Resend OTP" to get a new verification code.' };
    }

    const stored = await db.emailOtp.findUnique({
        where: { userId: otpUser.id },
    });

    if (!stored) {
        return { success: false, error: 'No OTP found. Please request a new one.' };
    }

    if (new Date() > stored.expiresAt) {
        await db.emailOtp.delete({ where: { userId: otpUser.id } });
        return { success: false, error: 'OTP has expired. Please request a new one.' };
    }

    const incomingHash = hashOtp(normalizedEmail, otp);
    const matches = constantTimeEqualHex(incomingHash, stored.otpHash);

    if (!matches) {
        return { success: false, error: 'Invalid OTP. Please try again.' };
    }

    await db.emailOtp.delete({ where: { userId: otpUser.id } });
    return { success: true, message: 'Email verified successfully!' };
}

export async function registerBrand(formData: FormData) {
    const companyName = formData.get('companyName') as string;
    const normalizedEmail = normalizeEmail(formData.get('email') as string);
    const password = formData.get('password') as string;
    const website = formData.get('website') as string;
    const industry = formData.get('industry') as string;

    const brandName = formData.get('brandName') as string;
    const location = formData.get('location') as string;
    const niche = formData.get('niche') as string;
    const campaignType = formData.get('campaignType') as string;
    const campaignBudget = formData.get('campaignBudget');
    const targetPlatforms = formData.get('targetPlatforms') as string;
    const preferredCreatorType = formData.get('preferredCreatorType') as string;
    const campaignGoals = formData.get('campaignGoals') as string;
    const minFollowers = formData.get('minFollowers');
    const maxFollowers = formData.get('maxFollowers');
    const minPricePerPost = formData.get('minPricePerPost');
    const maxPricePerPost = formData.get('maxPricePerPost');
    const priceType = formData.get('priceType') as string;

    if (!companyName || !normalizedEmail || !password) {
        return { success: false, error: 'Company name, email, and password are required.' };
    }

    try {
        const existingAccount = await findExistingAccountByEmail(normalizedEmail);
        if (existingAccount) {
            return { success: false, error: getBrandAccountConflictMessage(existingAccount) };
        }

        const hashedPassword = await hash(password, 12);

        const user = await db.user.create({
            data: {
                name: brandName || companyName,
                email: normalizedEmail,
                passwordHash: hashedPassword,
                role: UserRole.BRAND,
                brandProfile: {
                    create: {
                        companyName: brandName || companyName,
                        website: website || null,
                        industry: industry || null,
                        location: location || null,
                        niche: niche || null,
                        onboardingCompleted: true,
                        campaignType: campaignType || null,
                        campaignBudget: typeof campaignBudget === 'string' ? campaignBudget : null,
                        targetPlatforms: targetPlatforms || null,
                        preferredCreatorType: preferredCreatorType || null,
                        campaignGoals: campaignGoals || null,
                        minFollowers: safeParseInt(minFollowers),
                        maxFollowers: safeParseInt(maxFollowers),
                        minPricePerPost: safeParseFloat(minPricePerPost),
                        maxPricePerPost: safeParseFloat(maxPricePerPost),
                        priceType: priceType || 'Per Post',
                    },
                },
            },
            include: {
                brandProfile: true,
            },
        });

        ensureRequestExpiryJobStarted();

        let workflowSummary = null;
        let brandCampaignId: string | null = null;
        let campaignId: string | null = null;
        let workflowError: string | null = null;

        if (user.brandProfile) {
            const parsedBudget = safeParseFloat(campaignBudget) ?? 0;
            const parsedMinFollowers = Math.max(0, safeParseInt(minFollowers) ?? 10_000);
            const parsedMaxFollowers = Math.max(parsedMinFollowers, safeParseInt(maxFollowers) ?? 20_000);

            try {
                workflowSummary = await createBrandCampaignWorkflow({
                    brandId: user.brandProfile.id,
                    totalBudget: parsedBudget,
                    category: niche || industry || 'general',
                    minFollowers: parsedMinFollowers,
                    maxFollowers: parsedMaxFollowers,
                    summary: campaignGoals || campaignType || 'Initial brand campaign created from onboarding.',
                    title: `${brandName || companyName} ${campaignType || 'Campaign'}`.trim(),
                });
                brandCampaignId = workflowSummary.campaign.id;
            } catch (campaignError) {
                console.error('Brand campaign workflow setup failed:', campaignError);
                workflowError = 'Brand account was created, but influencer matching could not be initialized yet.';
            }

            try {
                if (parsedBudget >= parsedMaxFollowers) {
                    const campaign = await db.campaign.create({
                        data: {
                            brandId: user.brandProfile.id,
                            title: `${brandName || companyName} ${campaignType || 'Campaign'}`.trim() || 'New Campaign',
                            description: campaignGoals || null,
                            requirements: campaignGoals || null,
                            budget: parsedBudget,
                            niche: niche || null,
                            location: location || null,
                            platform: targetPlatforms || null,
                            influencerType: `${FOLLOWER_RANGE_PREFIX}${parsedMinFollowers}_${parsedMaxFollowers}`,
                            minFollowers: parsedMaxFollowers,
                            engagementMin: 5,
                            engagementMax: 10,
                            paymentType: 'UPFRONT',
                            paymentStatus: 'PENDING',
                            status: 'DRAFT',
                            images: '[]',
                        },
                    });
                    await ensureCampaignSuggestions(campaign.id, user.id);
                    campaignId = campaign.id;
                }
            } catch (autoCampaignError) {
                console.error('Campaign bootstrap failed:', autoCampaignError);
            }
        }

        return {
            success: true,
            userId: user.id,
            brandCampaignId,
            campaignId,
            workflowSummary,
            workflowError,
        };
    } catch (error) {
        console.error('Brand Registration Error:', error);
        return { success: false, error: 'Failed to register brand.' };
    }
}

export async function sendBrandOTP(mobile: string) {
    console.log(`Sending OTP to ${mobile}: 123456`);
    return { success: true, message: 'OTP sent successfully.' };
}
