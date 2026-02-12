import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const headersList = await headers();
        const apiKey = headersList.get('x-admin-key');

        // Basic protection - though user asked for this to be visible proof
        // We'll allow it public for now as requested for "PROOF", or check env

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

        const [
            userCount,
            otpUserCount,
            creatorCount,
            kycCount,
            chatThreadCount,
            messageCount
        ] = await Promise.all([
            db.user.count(),
            db.otpUser.count(),
            db.creator.count(),
            db.creatorKYCSubmission.count(),
            db.chatThread.count(),
            db.message.count()
        ]);

        const info = {
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
            db_host: maskUrl(dbUrl),
            direct_db_host: maskUrl(directUrl),
            counts: {
                users: userCount,
                otpUsers: otpUserCount,
                creators: creatorCount,
                kycSubmissions: kycCount,
                chatThreads: chatThreadCount,
                messages: messageCount
            }
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
