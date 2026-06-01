import { db } from "@/lib/db";
import TransactionsClient from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
    // 1. Fetch Escrow Transactions
    const escrowTransactions = await db.escrowTransaction.findMany({
        include: {
            contract: {
                include: {
                    brand: { select: { companyName: true, user: { select: { name: true, email: true } } } },
                    influencer: { select: { user: { select: { name: true, email: true } } } },
                    candidate: { include: { campaign: { select: { title: true } } } }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    // 2. Fetch Razorpay Deposits
    const razorpayPayments = await db.razorpayPayment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    // 3. Fetch Payout Records
    const payoutRecords = await db.payoutRecord.findMany({
        include: {
            campaign: { select: { title: true } },
            creator: { select: { user: { select: { name: true, email: true } } } }
        },
        orderBy: { paidAt: 'desc' },
        take: 100
    });

    // Aggregations
    const totalDeposits = razorpayPayments
        .filter(p => p.status.toLowerCase() === 'captured' || p.status.toLowerCase() === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalEscrow = escrowTransactions
        .filter(t => t.status === 'HELD' || t.status === 'PENDING')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPayouts = payoutRecords.reduce((sum, p) => sum + p.amount, 0);

    // Combine all into a unified chronological log
    const allTransactions = [
        ...escrowTransactions.map(t => ({
            id: t.id,
            date: t.createdAt,
            type: "ESCROW",
            amount: t.amount,
            status: t.status,
            reference: t.paymentGatewayRef || "Internal Lock",
            desc: `Escrow for "${t.contract.candidate?.campaign?.title || 'Campaign'}"`,
            from: t.contract.brand?.companyName || t.contract.brand?.user?.name || "Brand",
            to: t.contract.influencer?.user?.name || "Creator",
        })),
        ...razorpayPayments.map(p => ({
            id: p.id,
            date: p.createdAt,
            type: "DEPOSIT",
            amount: p.amount,
            status: p.status.toUpperCase(),
            reference: p.paymentId || p.orderId,
            desc: "Wallet Funding via Razorpay",
            from: "Brand Wallet Deposit",
            to: "Platform Escrow Pool",
        })),
        ...payoutRecords.map(p => ({
            id: p.id,
            date: p.paidAt,
            type: "PAYOUT",
            amount: p.amount,
            status: "COMPLETED",
            reference: p.utr,
            desc: `Payout for "${p.campaign?.title || 'Campaign'}"`,
            from: "Platform Escrow Pool",
            to: p.creator?.user?.name || "Creator",
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 100);

    const serializedTransactions = allTransactions.map(tx => ({
        ...tx,
        date: tx.date instanceof Date ? tx.date.toISOString() : new Date(tx.date).toISOString()
    }));

    return (
        <TransactionsClient 
            initialTransactions={serializedTransactions}
            totalDeposits={totalDeposits}
            totalEscrow={totalEscrow}
            totalPayouts={totalPayouts}
        />
    );
}
