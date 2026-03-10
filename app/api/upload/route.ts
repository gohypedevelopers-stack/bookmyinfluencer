
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserIdFromCookies } from "@/lib/session";
import { uploadToR2 } from "@/lib/storage";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";


export async function POST(req: NextRequest) {
    const userId = await getVerifiedUserIdFromCookies();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validation
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4'];

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, PDF, MP4.` }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const ext = file.name.split('.').pop() || 'file';
        const fileName = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;
        const key = `uploads/${fileName}`;

        // Upload Strategy Selection
        const hasR2 = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID);

        if (hasR2) {
            try {
                await uploadToR2(buffer, key, file.type);
                const publicUrl = process.env.NEXT_PUBLIC_R2_URL
                    ? `${process.env.NEXT_PUBLIC_R2_URL}/${key}`
                    : `/api/files/${key}`;
                return NextResponse.json({ success: true, url: publicUrl, key, method: "r2" });
            } catch (uploadError: any) {
                console.error("R2 Upload Error:", uploadError);
                // Fall through to local in dev if possible, or fail in prod
                if (process.env.NODE_ENV === "production") {
                    return NextResponse.json({ error: "Failed to upload to storage: " + uploadError.message }, { status: 500 });
                }
            }
        }

        // Local Fallback (Development only)
        if (process.env.NODE_ENV !== "production") {
            try {
                const uploadsDir = join(process.cwd(), "public", "uploads");
                if (!existsSync(uploadsDir)) {
                    await mkdir(uploadsDir, { recursive: true });
                }
                const filePath = join(uploadsDir, fileName);
                await writeFile(filePath, buffer);
                return NextResponse.json({ success: true, url: `/uploads/${fileName}`, key, method: "local" });
            } catch (fsError: any) {
                console.error("Local FS Upload Error:", fsError);
                return NextResponse.json({ error: "Failed to save locally: " + fsError.message }, { status: 500 });
            }
        }

        return NextResponse.json({
            error: "Upload service misconfigured. Missing R2 credentials for production."
        }, { status: 500 });


    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to process upload: " + (error.message || "Unknown error") }, { status: 500 });
    }
}

