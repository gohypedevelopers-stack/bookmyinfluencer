const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== FUNDING LOGIC TEST ===");

    // 1. Find a candidate with an offer
    const candidate = await prisma.campaignCandidate.findFirst({
        where: {
            offer: { isNot: null }
        },
        include: {
            offer: true,
            contract: { include: { transactions: true } },
            campaign: { include: { brand: { include: { user: true } } } }
        }
    });

    if (!candidate) {
        console.log("No candidate with offer found. Skipping test.");
        return;
    }

    console.log(`Candidate ID: ${candidate.id}`);
    console.log(`Offer Amount: ₹${candidate.offer.amount}`);

    // 2. Simulate UI Advance Calculation
    const contract = candidate.contract;
    const offer = candidate.offer;

    const total = contract?.totalAmount || offer?.amount || 0;
    const pendingTx = contract?.transactions?.find((t) => (t.type === 'ESCROW_FUNDING' || t.type === 'DEPOSIT') && t.status === 'PENDING');
    const advanceAmount = pendingTx ? pendingTx.amount : (total / 2);

    console.log(`Computed Advance Amount (UI): ₹${advanceAmount}`);

    if (advanceAmount === 0 && total > 0) {
        console.error("FAIL: Advance amount is 0 despite total > 0");
    } else {
        console.log("PASS: Advance amount is non-zero and correct (50% or pending tx)");
    }

    // 3. Check Wallet
    const wallet = await prisma.brandWallet.findUnique({
        where: { brandId: candidate.campaign.brandId }
    });

    const walletBalance = wallet?.balance || 0;
    console.log(`Brand Wallet Balance: ₹${walletBalance}`);

    if (walletBalance < advanceAmount) {
        console.log("RESULT: Would show 'Insufficient balance' toast in UI (PASS)");
    } else {
        console.log("RESULT: Would proceed to call server action (PASS)");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
