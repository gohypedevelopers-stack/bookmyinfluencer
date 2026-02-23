
import { db } from "@/lib/db";
import EarningsClient from "./EarningsClient";
import { ContractStatus, EscrowTransactionStatus } from "@/lib/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'INFLUENCER') {
        redirect('/login');
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { influencerProfile: true }
    });

    if (!user?.influencerProfile) {
        return <div className="p-10 text-center">Profile not found. Please complete setup.</div>;
    }

    const influencerId = user.influencerProfile.id;

    const jobs = await db.contract.findMany({
        where: {
            influencerId: influencerId,
            status: { in: [ContractStatus.ACTIVE, ContractStatus.COMPLETED] }
        },
        include: {
            brand: true,
            deliverables: true,
            transactions: true
        }
    });

    let stats = { earned: 0, pending: 0, available: 0 };

    // Simple calculation
    for (const job of jobs) {
        if (job.status === ContractStatus.COMPLETED) {
            stats.earned += job.totalAmount;
        }

        const funded = job.transactions.find((t) => t.status === EscrowTransactionStatus.FUNDED);
        const released = job.transactions.find((t) => t.status === EscrowTransactionStatus.RELEASED);

        if (funded) stats.pending += funded.amount;
        if (released) stats.available += released.amount;
    }

    return <EarningsClient stats={stats} jobs={jobs} influencerId={influencerId} />;
}
