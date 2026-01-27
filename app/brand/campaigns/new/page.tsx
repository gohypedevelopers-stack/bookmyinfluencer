
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import CampaignWizardClient from "./CampaignWizardClient";

export const dynamic = "force-dynamic";

export default async function CreateCampaignPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== 'BRAND' && session.user.role !== 'ADMIN')) {
        redirect('/login');
    }

    // Get Brand ID
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { brandProfile: true }
    });

    if (!user?.brandProfile) {
        return <div className="p-10 text-center">Brand profile not setup. Please contact support.</div>;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 antialiased min-h-screen flex flex-col">
            <CampaignWizardClient brandId={user.brandProfile.id} />
        </div>
    );
}
