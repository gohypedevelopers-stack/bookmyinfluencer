"use server"

import { cookies } from "next/headers"
import { signSession } from "@/lib/session"
import { db } from "@/lib/db"

export async function loginAction(formData: FormData) {
    // In a real app, we would validate credentials here
    // For now, we simulate a successful login for a "demo" user

    // Create a new user in the DB to satisfy foreign key constraints
    const email = `demo-${Math.random().toString(36).substring(7)}@example.com`

    // Create the OtpUser record (mapped to "users" table)
    // We need to match the schema requirements
    const newUser = await db.otpUser.create({
        data: {
            email: email,
            verifiedAt: new Date(),
        }
    })

    const userId = newUser.id

    const token = signSession(userId)
    const cookieStore = await cookies()

    cookieStore.set("session", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true }
}
