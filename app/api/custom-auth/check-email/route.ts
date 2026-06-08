import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()
        const normalizedEmail = email ? String(email).trim().toLowerCase() : ""
        if (!normalizedEmail) {
            return NextResponse.json({ exists: false, error: "Email is required" }, { status: 400 })
        }
        
        // Check main user table
        const user = await db.user.findUnique({
            where: { email: normalizedEmail }
        })
        if (user) {
            return NextResponse.json({ exists: true, role: user.role })
        }
        
        // Check otpUser table (Creator registration flow uses this as a staging step)
        const otpUser = await db.otpUser.findUnique({
            where: { email: normalizedEmail },
            include: { creator: true }
        })
        if (otpUser && otpUser.creator) {
            return NextResponse.json({ exists: true, role: "INFLUENCER" })
        }

        return NextResponse.json({ exists: false })
    } catch (error: any) {
        console.error("Error in check-email API:", error)
        return NextResponse.json({ exists: false, error: error.message || "Database error" }, { status: 500 })
    }
}
