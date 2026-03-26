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

const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                console.warn("[AUTH][credentials] Missing credentials")
                return null
            }

            const normalizedEmail = credentials.email.trim().toLowerCase()
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
                    const brand = await db.brandProfile.findUnique({
                        where: { userId: user.id },
                        select: { onboardingCompleted: true },
                    })
                    if (brand) {
                        onboardingComplete = brand.onboardingCompleted
                    }
                }

                console.info("[AUTH][credentials] Login successful", {
                    email: normalizedEmail,
                    role: user.role,
                    onboardingComplete,
                    kycStatus,
                })

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role as UserRole,
                    image: user.image,
                    kycStatus,
                    onboardingComplete,
                }
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

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    )
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
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
                token.role = user.role
                token.id = user.id
                token.kycStatus = user.kycStatus
                token.onboardingComplete = (user as any).onboardingComplete || false
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
