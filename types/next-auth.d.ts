import { UserRole, KYCStatus } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: UserRole
            kycStatus?: KYCStatus
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: UserRole
        kycStatus?: KYCStatus
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: UserRole
        kycStatus?: KYCStatus
    }
}
