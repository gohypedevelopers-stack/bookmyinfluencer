import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const dbUrl = process.env.DATABASE_URL || "";
        const directUrl = process.env.DIRECT_URL || "";

        // Masking logic
        const maskUrl = (url: string) => {
            try {
                if (!url) return "NOT_SET";
                const urlObj = new URL(url);
                return `protocol=${urlObj.protocol}, host=${urlObj.host}, path=${urlObj.pathname}`;
            } catch (e) {
                return "INVALID_URL";
            }
        };

        const userCount = await db.user.count();
        const otpUserCount = await db.otpUser.count();
        const creatorCount = await db.creator.count();
        const kycCount = await db.creatorKYCSubmission.count();

        // Check for any recent audit logs (last 5)
        const recentLogs = await db.auditLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { action: true, entity: true, createdAt: true }
        });

        const info = {
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
            db_host: maskUrl(dbUrl),
            direct_db_host: maskUrl(directUrl),
            counts: {
                users: userCount,
                otpUsers: otpUserCount,
                creators: creatorCount,
                kycSubmissions: kycCount
            },
            recent_logs: recentLogs
        };

        console.log("[Health Check] DB Info:", JSON.stringify(info, null, 2));

        return NextResponse.json(info);
    } catch (error: any) {
        console.error("[Health Check] Failed:", error);
        return NextResponse.json({
            status: "error",
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
