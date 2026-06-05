import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"

import { db } from "@/lib/db"
import { UserRole, KYCStatus } from "@/lib/enums"

async function getCreatorAuthState(email: string) {
    const otpUser = await db.otpUser.findUnique({
        where: { email },
        select: { id: true },
    })

    if (!otpUser) {
        return {
            otpUserId: null,
            creator: null,
        }
    }

    const creator = await db.creator.findUnique({
        where: { userId: otpUser.id },
        select: { verificationStatus: true, onboardingCompleted: true },
    })

    return {
        otpUserId: otpUser.id,
        creator,
    }
}

function getNextAuthSecret() {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret && process.env.NODE_ENV === "production") {
        throw new Error("Missing NEXTAUTH_SECRET or AUTH_SECRET in production")
    }
    return secret
}

async function getDatabaseAuthUser(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return null

    const user = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: {
            influencerProfile: { select: { kyc: true } },
            brandProfile: { select: { onboardingCompleted: true } },
        },
    })

    if (!user) return null

    let kycStatus: KYCStatus = (user.influencerProfile?.kyc?.status || "NOT_SUBMITTED") as KYCStatus
    let onboardingComplete = false

    if (user.role === "INFLUENCER") {
        const creatorState = await getCreatorAuthState(user.email)

        if (creatorState.creator) {
            if (creatorState.creator.verificationStatus && creatorState.creator.verificationStatus !== "NOT_SUBMITTED") {
                kycStatus = creatorState.creator.verificationStatus as KYCStatus
            }
            onboardingComplete = creatorState.creator.onboardingCompleted
        }
    } else if (user.role === "BRAND") {
        onboardingComplete = user.brandProfile?.onboardingCompleted || false
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        image: user.image,
        kycStatus,
        onboardingComplete,
    }
}

const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
            isGoogleLogin: { label: "Is Google Login", type: "text" },
            name: { label: "Name", type: "text" },
            image: { label: "Image", type: "text" },
            role: { label: "Role", type: "text" }
        },
        async authorize(credentials) {
            if (!credentials?.email) {
                console.warn("[AUTH][credentials] Missing email")
                return null
            }

            const normalizedEmail = credentials.email.trim().toLowerCase()
            const isGoogle = credentials.isGoogleLogin === "true"

            if (isGoogle) {
                console.info("[AUTH][credentials] Google login attempt", { email: normalizedEmail })
                try {
                    let user = await db.user.findUnique({
                        where: { email: normalizedEmail },
                        include: {
                            influencerProfile: true,
                            brandProfile: true,
                        }
                    })

                    const targetRole = (credentials.role || "INFLUENCER") as "INFLUENCER" | "BRAND"

                    if (!user) {
                        user = await db.user.create({
                            data: {
                                email: normalizedEmail,
                                name: credentials.name || "User",
                                image: credentials.image || null,
                                role: targetRole,
                            },
                            include: {
                                influencerProfile: true,
                                brandProfile: true,
                            }
                        })
                    }

                    if (user.role === "INFLUENCER") {
                        if (!user.influencerProfile) {
                            await db.influencerProfile.create({
                                data: {
                                    userId: user.id,
                                    niche: "General",
                                    onboardingCompleted: false,
                                }
                            })
                        }
                        
                        let otpUser = await db.otpUser.findUnique({
                            where: { email: normalizedEmail },
                            include: { creator: true }
                        })

                        if (!otpUser) {
                            otpUser = await db.otpUser.create({
                                data: {
                                    email: normalizedEmail,
                                    verifiedAt: new Date(),
                                },
                                include: { creator: true }
                            })
                        }

                        if (!otpUser.creator) {
                            await db.creator.create({
                                data: {
                                    userId: otpUser.id,
                                    email: normalizedEmail,
                                    fullName: credentials.name || "Creator",
                                    displayName: credentials.name || "Creator",
                                    profileImageUrl: credentials.image || null,
                                    onboardingCompleted: false,
                                }
                            })
                        }
                    } else if (user.role === "BRAND") {
                        if (!user.brandProfile) {
                            await db.brandProfile.create({
                                data: {
                                    userId: user.id,
                                    companyName: credentials.name || "Brand",
                                    onboardingCompleted: true,
                                }
                            })
                        }

                        const brandProfile = await db.brandProfile.findUnique({
                            where: { userId: user.id },
                            include: { brandWallet: true }
                        })

                        if (brandProfile && !brandProfile.brandWallet) {
                            await db.brandWallet.create({
                                data: {
                                    brandId: brandProfile.id,
                                    balance: 0,
                                    currency: "INR",
                                }
                            })
                        }
                    }

                    const authUser = await getDatabaseAuthUser(user.email)
                    if (!authUser) return null

                    console.info("[AUTH][credentials] Google login successful", {
                        email: normalizedEmail,
                        role: authUser.role,
                        onboardingComplete: authUser.onboardingComplete,
                    })

                    return authUser
                } catch (error) {
                    console.error("[AUTH][credentials] Google authorize database error", error)
                    return null
                }
            }

            if (!credentials?.password) {
                console.warn("[AUTH][credentials] Missing credentials password")
                return null
            }

            console.info("[AUTH][credentials] Login attempt", { email: normalizedEmail })

            try {
                const user = await db.user.findUnique({
                    where: { email: normalizedEmail },
                    include: { influencerProfile: { select: { kyc: true } } },
                })

                if (!user || !user.passwordHash) {
                    const creatorState = await getCreatorAuthState(normalizedEmail)

                    if (creatorState.otpUserId) {
                        console.error("[AUTH][credentials] OTP user exists without shadow User/password login", {
                            email: normalizedEmail,
                            otpUserId: creatorState.otpUserId,
                        })
                    } else {
                        console.warn("[AUTH][credentials] User not found", { email: normalizedEmail })
                    }
                    return null
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
                if (!isValid) {
                    console.warn("[AUTH][credentials] Password mismatch", { email: normalizedEmail })
                    return null
                }

                const authUser = await getDatabaseAuthUser(user.email)
                if (!authUser) return null

                console.info("[AUTH][credentials] Login successful", {
                    email: normalizedEmail,
                    role: authUser.role,
                    onboardingComplete: authUser.onboardingComplete,
                    kycStatus: authUser.kycStatus,
                })

                return authUser
            } catch (error) {
                console.error("[AUTH][credentials] Database failure", {
                    email: normalizedEmail,
                    name: error instanceof Error ? error.name : "UnknownError",
                    message: error instanceof Error ? error.message : String(error),
                })

                if (
                    process.env.NODE_ENV === "development" &&
                    normalizedEmail === "test@dev.local" &&
                    credentials.password === "dev123"
                ) {
                    console.warn("[AUTH][credentials] DEV bypass user granted")
                    return {
                        id: "dev-test-user-id",
                        name: "Dev Test User",
                        email: "test@dev.local",
                        role: "BRAND" as UserRole,
                        image: null,
                        kycStatus: "APPROVED" as KYCStatus,
                    }
                }

                return null
            }
        },
    }),
]

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isGoogleConfigured = googleClientId && 
    googleClientId.trim() !== "" && 
    !googleClientId.startsWith("your-") && 
    googleClientSecret && 
    googleClientSecret.trim() !== "" && 
    !googleClientSecret.startsWith("your-");

if (isGoogleConfigured) {
    providers.push(
        GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
        })
    )
}

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const isGithubConfigured = githubClientId && 
    githubClientId.trim() !== "" && 
    !githubClientId.startsWith("your-") && 
    githubClientSecret && 
    githubClientSecret.trim() !== "" && 
    !githubClientSecret.startsWith("your-");

if (isGithubConfigured) {
    providers.push(
        GithubProvider({
            clientId: githubClientId!,
            clientSecret: githubClientSecret!,
        })
    )
}

export const authOptions: NextAuthOptions = {
    secret: getNextAuthSecret(),
    debug: process.env.NEXTAUTH_DEBUG === "true",
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers,
    logger: {
        error(code, metadata) {
            console.error("[NextAuth][error]", code, metadata)
        },
        warn(code) {
            console.warn("[NextAuth][warn]", code)
        },
        debug(code, metadata) {
            if (process.env.NODE_ENV !== "production") {
                console.debug("[NextAuth][debug]", code, metadata)
            }
        },
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                const authUser = (user as any).role
                    ? user
                    : user.email
                        ? await getDatabaseAuthUser(user.email)
                        : null

                if (authUser) {
                    token.role = authUser.role
                    token.id = authUser.id
                    token.kycStatus = authUser.kycStatus
                    token.onboardingComplete = (authUser as any).onboardingComplete || false
                }
            }

            if (trigger === "update" && session) {
                return { ...token, ...session }
            }

            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as UserRole
                session.user.id = token.id as string
                session.user.kycStatus = token.kycStatus as KYCStatus
                ; (session.user as any).onboardingComplete = token.onboardingComplete || false
            }
            return session
        },
    },
}
