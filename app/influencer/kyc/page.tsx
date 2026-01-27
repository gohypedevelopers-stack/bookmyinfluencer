
import { db } from "@/lib/db";
import KYCClient from "./KYCClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { KYCStatus } from "@prisma/client";

export default async function KYCPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'INFLUENCER') {
        redirect('/login');
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { influencerProfile: { include: { kyc: true } } }
    });

    // Check if user has profile, if not redirect to setup? Assuming seeded users have profiles.
    if (!user?.influencerProfile) {
        return <div>Profile missing.</div>;
    }

    const currentStatus = user.influencerProfile.kyc?.status || KYCStatus.NOT_SUBMITTED;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <KYCClient
                influencerId={user.influencerProfile.id}
                currentStatus={currentStatus}
            />
        </div>
    );
}
