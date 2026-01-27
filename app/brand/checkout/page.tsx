
import { db } from "@/lib/db";
import CheckoutClient from "./CheckoutClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const contractId = params.contractId as string;

    if (!contractId) {
        return <div className="p-10 text-center text-red-500">Invalid Checkout Link. Missing contract ID.</div>;
    }

    const contract = await db.contract.findUnique({
        where: { id: contractId },
        include: {
            influencer: { include: { user: true } },
            brand: true,
            deliverables: true,
            transactions: true
        }
    });

    if (!contract) {
        return <div className="p-10 text-center text-red-500">Contract not found.</div>;
    }

    return <CheckoutClient contract={contract} />;
}
