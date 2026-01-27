
import { db } from "@/lib/db";
import AdminKYCClient from "./AdminKYCClient";

export const dynamic = "force-dynamic";

export default async function AdminKYCPage() {
    const submissions = await db.kYCSubmission.findMany({
        include: {
            profile: {
                include: { user: true }
            }
        },
        orderBy: { submittedAt: 'desc' }
    });

    return <AdminKYCClient submissions={submissions} />;
}
