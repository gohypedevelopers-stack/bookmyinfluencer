import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { UserRole, KYCStatus } from "@prisma/client"

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Missing credentials')
                    return null
                }

                console.log('🔐 Login attempt for:', credentials.email);

                try {
                    const user = await db.user.findUnique({
                        where: { email: credentials.email.trim().toLowerCase() },
                        include: { influencerProfile: { select: { kyc: true } } }
                    })

                    if (!user || !user.passwordHash) {
                        console.log('❌ User not found or no password hash')
                        return null
                    }

                    console.log('✅ User found:', user.email, '- Role:', user.role)

                    const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

                    if (!isValid) {
                        console.log('❌ Password mismatch')
                        return null
                    }

                    console.log('✅ Login successful!')

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role as UserRole,
                        image: user.image,
                        kycStatus: (user.influencerProfile?.kyc?.status || "NOT_SUBMITTED") as KYCStatus
                    }
                } catch (error) {
                    console.error("Auth error:", error);
                    // DEV BYPASS: Allow test login when DB is unreachable
                    if (process.env.NODE_ENV === 'development' &&
                        credentials.email === 'test@dev.local' &&
                        credentials.password === 'dev123') {
                        console.warn("⚠️ DEV BYPASS: Logging in as test user (DB unreachable)");
                        return {
                            id: 'dev-test-user-id',
                            name: 'Dev Test User',
                            email: 'test@dev.local',
                            role: 'BRAND' as UserRole,
                            image: null,
                            kycStatus: 'APPROVED' as KYCStatus
                        }
                    }
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
                token.kycStatus = user.kycStatus
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as UserRole
                session.user.id = token.id as string
                session.user.kycStatus = token.kycStatus as KYCStatus
            }
            return session
        }
    }
}
