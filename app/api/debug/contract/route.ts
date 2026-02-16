import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    // Only allow in development
    if (process.env.NODE_ENV === "production" && !req.url.includes("force=1")) {
        return NextResponse.json({ error: "Debug mode disabled in production" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    if (!contractId) {
        return NextResponse.json({ error: "contractId required" }, { status: 400 });
    }

    try {
        const contract = await db.contract.findUnique({
            where: { id: contractId },
            include: {
                transactions: true,
                candidate: {
                    include: {
                        campaign: true,
                        influencer: {
                            include: { user: { select: { name: true, email: true } } }
                        }
                    }
                },
                brand: true
            }
        });

        if (!contract) {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }

        const wallet = await db.brandWallet.findUnique({
            where: { brandId: contract.brandId }
        });

        // Get related wallet transactions
        const walletTransactions = await db.walletTransaction.findMany({
            where: { reference: contractId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            contract,
            wallet,
            walletTransactions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
