import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.text();
    const [socketId, channelName] = data
        .split("&")
        .map((str) => str.split("=")[1]);

    const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
        user_id: session.user.id,
        user_info: {
            name: session.user.name,
            email: session.user.email,
        },
    });

    // Simple security check:
    // If channel is private-user-{id}, ensure id matches session.user.id
    if (channelName.startsWith("private-user-")) {
        const requestedId = channelName.replace("private-user-", "");
        if (requestedId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }
    }

    // Update lastSeenAt
    await db.user.update({
        where: { id: session.user.id },
        data: { lastSeenAt: new Date() }
    });

    return NextResponse.json(authResponse);
}
