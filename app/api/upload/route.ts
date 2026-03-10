
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToR2 } from "@/lib/storage";


export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
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

        // Upload to R2
        if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
            console.error("❌ R2 Storage not configured in environment variables.");

            // In development, we might want to allow this to fail gracefully or use local fs if really needed, 
            // but for a "fix it" request for production 500, we must point out the configuration issue.
            if (process.env.NODE_ENV === "production") {
                return NextResponse.json({
                    error: "Upload service misconfigured. Missing R2 credentials."
                }, { status: 500 });
            }
        }

        try {
            await uploadToR2(buffer, key, file.type);

            // For R2, we typically use a public bucket URL or a CDN URL.
            // If R2_PUBLIC_URL is not set, we can't easily return a permanent public link without a custom domain.
            // However, many users use a custom domain or the R2 dev endpoint.
            const publicUrl = process.env.NEXT_PUBLIC_R2_URL
                ? `${process.env.NEXT_PUBLIC_R2_URL}/${key}`
                : `/api/files/${key}`; // We'll need a proxy route to serve these if no public URL

            return NextResponse.json({ success: true, url: publicUrl, key });
        } catch (uploadError: any) {
            console.error("R2 Upload Error:", uploadError);
            return NextResponse.json({ error: "Failed to upload to storage: " + uploadError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to process upload: " + (error.message || "Unknown error") }, { status: 500 });
    }
}

