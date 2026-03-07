import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Test DB connection
        const userCount = await db.user.count();
        const creatorCount = await db.creator.count();

        return NextResponse.json({
            status: "ok",
            database: "connected",
            counts: {
                users: userCount,
                creators: creatorCount
            },
            env: {
                NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "missing",
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "missing",
                DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
                SMTP_USER: process.env.SMTP_USER ? "set" : "missing"
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            env: {
                DATABASE_URL_SET: !!process.env.DATABASE_URL
            }
        }, { status: 500 });
    }
}
