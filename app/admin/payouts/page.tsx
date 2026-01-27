
import { db } from "@/lib/db";
import AdminPayoutsClient from "./AdminPayoutsClient";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
    const payouts = await db.payoutRequest.findMany({
        include: {
            influencer: {
                include: { user: true }
            }
        },
        orderBy: { requestedAt: 'desc' }
    });

    return <AdminPayoutsClient payouts={payouts} />;
}
