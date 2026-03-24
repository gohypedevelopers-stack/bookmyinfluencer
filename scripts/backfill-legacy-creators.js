const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : email;
}

function firstNonEmpty(...values) {
    for (const value of values) {
        if (value !== null && value !== undefined && value !== "") {
            return value;
        }
    }
    return null;
}

function handleToUrl(provider, handle) {
    if (!handle) return null;
    if (handle.startsWith("http://") || handle.startsWith("https://")) return handle;

    const cleanHandle = handle.replace(/^@/, "");
    if (provider === "instagram") return `https://instagram.com/${cleanHandle}`;
    if (provider === "youtube") return `https://youtube.com/@${cleanHandle}`;
    if (provider === "tiktok") return `https://tiktok.com/@${cleanHandle}`;
    return handle;
}

async function main() {
    const legacyUsers = await prisma.user.findMany({
        where: {
            role: "INFLUENCER",
            influencerProfile: { isNot: null },
        },
        select: {
            name: true,
            email: true,
            image: true,
            createdAt: true,
            influencerProfile: {
                select: {
                    niche: true,
                    bio: true,
                    socialData: true,
                    pricing: true,
                    price: true,
                    priceStory: true,
                    pricePost: true,
                    priceCollab: true,
                    priceType: true,
                    onboardingCompleted: true,
                    platforms: true,
                    instagramHandle: true,
                    youtubeHandle: true,
                    tiktokHandle: true,
                    kyc: {
                        select: {
                            status: true,
                            verifiedByAdminAt: true,
                        },
                    },
                },
            },
        },
    });

    let otpUsersCreated = 0;
    let creatorsCreated = 0;
    let creatorsUpdated = 0;

    for (const legacyUser of legacyUsers) {
        const email = normalizeEmail(legacyUser.email);
        const source = legacyUser.influencerProfile;
        if (!email || !source) continue;

        const existingOtpUser = await prisma.otpUser.findUnique({
            where: { email },
            select: { id: true },
        });

        const otpUser = existingOtpUser || await prisma.otpUser.create({
            data: {
                email,
                verifiedAt: legacyUser.createdAt,
                createdAt: legacyUser.createdAt,
            },
            select: { id: true },
        });

        if (!existingOtpUser) {
            otpUsersCreated += 1;
        }

        const mappedCreator = {
            email,
            fullName: legacyUser.name,
            displayName: legacyUser.name,
            profileImageUrl: legacyUser.image,
            niche: source.niche,
            bio: source.bio,
            pricing: source.pricing,
            price: firstNonEmpty(source.price, source.pricePost, source.priceCollab, source.priceStory),
            priceStory: source.priceStory,
            pricePost: source.pricePost,
            priceCollab: source.priceCollab,
            priceType: source.priceType || "Per Post",
            onboardingCompleted: source.onboardingCompleted,
            platforms: source.platforms,
            instagramUrl: handleToUrl("instagram", source.instagramHandle),
            youtubeUrl: handleToUrl("youtube", source.youtubeHandle),
            tiktokUrl: handleToUrl("tiktok", source.tiktokHandle),
            rawSocialData: source.socialData,
            verificationStatus: source.kyc?.status || "NOT_SUBMITTED",
            verifiedAt: source.kyc?.verifiedByAdminAt || null,
        };

        const existingCreator = await prisma.creator.findUnique({
            where: { userId: otpUser.id },
            select: {
                email: true,
                fullName: true,
                displayName: true,
                profileImageUrl: true,
                niche: true,
                bio: true,
                pricing: true,
                price: true,
                priceStory: true,
                pricePost: true,
                priceCollab: true,
                priceType: true,
                onboardingCompleted: true,
                platforms: true,
                instagramUrl: true,
                youtubeUrl: true,
                tiktokUrl: true,
                rawSocialData: true,
                verificationStatus: true,
                verifiedAt: true,
            },
        });

        if (!existingCreator) {
            await prisma.creator.create({
                data: {
                    userId: otpUser.id,
                    ...mappedCreator,
                },
            });
            creatorsCreated += 1;
            continue;
        }

        const updateData = {};
        for (const [key, value] of Object.entries(mappedCreator)) {
            const currentValue = existingCreator[key];
            const shouldFill =
                (currentValue === null || currentValue === undefined || currentValue === "") &&
                value !== null &&
                value !== undefined &&
                value !== "";

            if (shouldFill) {
                updateData[key] = value;
            }
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.creator.update({
                where: { userId: otpUser.id },
                data: updateData,
            });
            creatorsUpdated += 1;
        }
    }

    console.log(JSON.stringify({
        legacyUsersScanned: legacyUsers.length,
        otpUsersCreated,
        creatorsCreated,
        creatorsUpdated,
    }, null, 2));
}

main()
    .catch((error) => {
        console.error("Legacy creator backfill failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
