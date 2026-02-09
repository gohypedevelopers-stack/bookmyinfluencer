
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Sanitize filename
        const sanitizedParams = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}_${sanitizedParams}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "campaigns");
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, buffer);

        const url = `/uploads/campaigns/${filename}`;

        return NextResponse.json({ success: true, url });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
