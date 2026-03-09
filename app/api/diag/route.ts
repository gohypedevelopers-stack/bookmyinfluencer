import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Test DB connection
        const [userCount, creatorCount, creatorPriceColumn] = await Promise.all([
            db.user.count(),
            db.creator.count(),
            db.$queryRaw<Array<{ exists: boolean }>>`
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name = 'creators'
                      AND column_name = 'price'
                )
            `,
        ]);

        return NextResponse.json({
            status: "ok",
            database: "connected",
            counts: {
                users: userCount,
                creators: creatorCount
            },
            creator_price_column_exists: creatorPriceColumn[0]?.exists ?? false,
            env: {
                NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "missing",
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "missing",
                AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "missing",
                DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
                DIRECT_URL: process.env.DIRECT_URL ? "set" : "missing",
                SMTP_USER: process.env.SMTP_USER ? "set" : "missing",
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "set" : "missing",
                GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "set" : "missing",
                GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "set" : "missing",
                GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? "set" : "missing",
                VERCEL_ENV: process.env.VERCEL_ENV || null,
                VERCEL_URL: process.env.VERCEL_URL || null,
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
