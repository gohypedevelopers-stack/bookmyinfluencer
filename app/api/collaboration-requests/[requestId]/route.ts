import { NextResponse } from "next/server";
import { acceptCollaborationRequest, rejectCollaborationRequest } from "@/services/collabService";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ requestId: string }> },
) {
    try {
        const { requestId } = await params;
        const body = await request.json().catch(() => ({}));
        const action = body?.action;

        if (action === "accept") {
            const workflowSummary = await acceptCollaborationRequest(requestId);
            return NextResponse.json({ success: true, workflowSummary });
        }

        if (action === "reject") {
            const workflowSummary = await rejectCollaborationRequest(
                requestId,
                typeof body?.reason === "string" && body.reason.trim()
                    ? body.reason.trim()
                    : "rejected_by_influencer",
            );
            return NextResponse.json({ success: true, workflowSummary });
        }

        return NextResponse.json(
            { success: false, error: "Action must be accept or reject." },
            { status: 400 },
        );
    } catch (error) {
        console.error("Collaboration request update failed", error);
        return NextResponse.json(
            { success: false, error: "Failed to update collaboration request." },
            { status: 500 },
        );
    }
}