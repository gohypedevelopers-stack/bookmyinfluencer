"use server"

import { db } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function createWalletRechargeOrder(amount: number) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${session.user.id.slice(0, 5)}`,
        };

        const order = await razorpay.orders.create(options);

        // Store order temporarily or just return it. 
        // Best practice: Store pending payment record.
        await db.razorpayPayment.create({
            data: {
                orderId: order.id,
                amount: amount,
                status: "CREATED",
                currency: "INR"
            }
        });

        return { success: true, orderId: order.id, amount: amount, key: process.env.RAZORPAY_KEY_ID };
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return { success: false, error: "Failed to create payment order" };
    }
}

export async function verifyWalletRecharge(
    orderId: string,
    paymentId: string,
    signature: string
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return { success: false, error: "Server configuration error" };

    try {
        // 1. Verify Signature
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== signature) {
            return { success: false, error: "Invalid payment signature" };
        }

        // 2. Transactional Update
        // Start transaction to ensure atomicity
        await db.$transaction(async (tx) => {
            // Update Payment Status
            await tx.razorpayPayment.update({
                where: { orderId },
                data: {
                    paymentId,
                    signature,
                    status: "SUCCESS",
                    updatedAt: new Date()
                }
            });

            // Get or Create Brand Wallet
            const brandProfile = await tx.brandProfile.findUnique({
                where: { userId: session.user.id }
            });

            if (!brandProfile) throw new Error("Brand profile not found");

            let wallet = await tx.brandWallet.findUnique({
                where: { brandId: brandProfile.id }
            });

            if (!wallet) {
                wallet = await tx.brandWallet.create({
                    data: {
                        brandId: brandProfile.id,
                        balance: 0
                    }
                });
            }

            // Record Transaction
            const rzPayment = await tx.razorpayPayment.findUnique({ where: { orderId } });
            const amount = rzPayment!.amount; // Use stored amount to avoid client manipulation

            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: "RECHARGE_APPROVED",
                    amount: amount,
                    title: "Wallet Recharge",
                    reference: paymentId,
                    status: "SUCCESS"
                }
            });

            // Update Balance
            await tx.brandWallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { increment: amount }
                }
            });
        });

        revalidatePath("/brand/wallet");
        return { success: true };
    } catch (error) {
        console.error("Verification Error:", error);
        return { success: false, error: "Payment verification failed" };
    }
}

export async function getBrandWalletData() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const brandProfile = await db.brandProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!brandProfile) return { success: false, error: "Brand not found" };

        const wallet = await db.brandWallet.findUnique({
            where: { brandId: brandProfile.id },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" },
                    take: 20
                }
            }
        });

        if (!wallet) {
            return {
                success: true,
                data: {
                    walletBalance: 0,
                    totalSpent: 0,
                    inEscrow: 0,
                    transactions: [],
                    paymentMethods: []
                }
            };
        }

        // Calculate metadata
        // In strict manual mode, "In Escrow" might mean "Locked" amount
        // We trace transactions to audit.
        // For now simple sums.

        return {
            success: true,
            data: {
                walletBalance: wallet.balance,
                totalSpent: 0, // TODO: calculate from spending txs
                inEscrow: 0, // TODO: calculate from locks
                transactions: wallet.transactions,
                paymentMethods: [] // Placeholder
            }
        };
    } catch (error) {
        console.error("Wallet Fetch Error:", error);
        return { success: false, error: "Failed to fetch wallet" };
    }
}

// --- FUND CANDIDATE WRAPPER ---
export async function fundCandidateFromWallet(candidateId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return { success: false, error: "Unauthorized" };

    console.log(`[FUNDING_DEBUG] fundCandidateFromWallet for Candidate: ${candidateId}`);

    try {
        // 1. Get Candidate & Offer
        const candidate = await db.campaignCandidate.findUnique({
            where: { id: candidateId },
            include: { offer: true, contract: true, campaign: true }
        });

        if (!candidate) return { success: false, error: "Candidate not found" };
        if (!candidate.offer) return { success: false, error: "No offer details found. Please set terms first." };

        let contractId = candidate.contract?.id;

        // 2. Create Contract if missing
        if (!contractId) {
            console.log(`[FUNDING_DEBUG] Creating contract for Candidate: ${candidateId}`);
            const advanceAmount = candidate.offer.amount / 2;

            const newContract = await db.contract.create({
                data: {
                    candidateId: candidate.id,
                    brandId: candidate.campaign.brandId,
                    influencerId: candidate.influencerId,
                    totalAmount: candidate.offer.amount,
                    platformFee: 0,
                    status: "PENDING_ESCROW",
                    transactions: {
                        create: {
                            amount: advanceAmount,
                            type: "ESCROW_FUNDING",
                            status: "PENDING",
                            currency: "INR"
                        }
                    }
                }
            });
            contractId = newContract.id;
            console.log(`[FUNDING_DEBUG] Contract created: ${contractId}, Advance Transaction: ₹${advanceAmount}`);
        }

        // 3. Fund it
        return await fundContractFromWallet(contractId);

    } catch (error: any) {
        console.error("[FUNDING_DEBUG] Fund Candidate Error:", error);
        return { success: false, error: error.message };
    }
}


// --- FUNDING CAMPAIGN (ADVANCE LOCK) ---
export async function fundContractFromWallet(contractId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Use a transaction
    try {
        return await db.$transaction(async (tx) => {
            // 1. Get Contract & Pending Transaction
            const contract = await tx.contract.findUnique({
                where: { id: contractId },
                include: {
                    transactions: true,
                    brand: true,
                    influencer: true,
                    candidate: {
                        include: { campaign: true }
                    }
                }
            });

            if (!contract) throw new Error("Contract not found");
            if (contract.brand.userId !== session.user.id) throw new Error("Unauthorized");

            const pendingTx = contract.transactions.find(
                t => t.status === "PENDING" && (t.type === "ESCROW_FUNDING" || t.type === "DEPOSIT")
            );

            const amountToLock = pendingTx ? pendingTx.amount : (contract.totalAmount / 2);

            console.log(`[FUNDING_DEBUG] Starting funding for Contract: ${contractId}`);
            console.log(`[FUNDING_DEBUG] Brand User ID: ${session.user.id}`);
            console.log(`[FUNDING_DEBUG] Amount to Lock: ₹${amountToLock}`);

            if (amountToLock <= 0) throw new Error("Invalid amount");

            // 2. Check Wallet Balance
            const wallet = await tx.brandWallet.findUnique({
                where: { brandId: contract.brandId }
            });

            console.log(`[FUNDING_DEBUG] Wallet Balance Before: ₹${wallet?.balance || 0}`);

            if (!wallet || wallet.balance < amountToLock) {
                console.error(`[FUNDING_DEBUG] Insufficient funds. Need: ₹${amountToLock}, Has: ₹${wallet?.balance || 0}`);
                throw new Error(`Insufficient wallet balance. Required: ₹${amountToLock}, Available: ₹${wallet?.balance || 0}`);
            }

            // 3. Deduct from Wallet
            const updatedWallet = await tx.brandWallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amountToLock } }
            });

            console.log(`[FUNDING_DEBUG] Wallet Balance After: ₹${updatedWallet.balance}`);

            // 4. Record Wallet Transaction
            const walletTx = await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: "ADVANCE_LOCK",
                    amount: amountToLock,
                    campaignId: contract.candidate?.campaignId,
                    reference: contract.id,
                    status: "SUCCESS"
                }
            });

            console.log(`[FUNDING_DEBUG] Wallet Transaction created: ${walletTx.id}`);

            // 5. Update Contract/Transaction Status
            if (pendingTx) {
                await tx.escrowTransaction.update({
                    where: { id: pendingTx.id },
                    data: { status: "FUNDED" }
                });
                console.log(`[FUNDING_DEBUG] Escrow Transaction ${pendingTx.id} marked as FUNDED`);
            } else {
                // Create one if missing for record
                await tx.escrowTransaction.create({
                    data: {
                        contractId: contract.id,
                        amount: amountToLock,
                        currency: "INR",
                        type: "ESCROW_FUNDING",
                        status: "FUNDED"
                    }
                });
                console.log(`[FUNDING_DEBUG] New Escrow Transaction created and marked as FUNDED`);
            }

            const updatedContract = await tx.contract.update({
                where: { id: contractId },
                data: { status: "ACTIVE" }
            });

            console.log(`[FUNDING_DEBUG] Contract status updated from ${contract.status} to ${updatedContract.status}`);

            if (contract.candidateId) {
                await tx.campaignCandidate.update({
                    where: { id: contract.candidateId },
                    data: { status: "HIRED" }
                });
                console.log(`[FUNDING_DEBUG] Candidate ${contract.candidateId} status updated to HIRED`);
            }

            // 6. Notify Influencer
            if (contract.influencer.userId) {
                await tx.notification.create({
                    data: {
                        userId: contract.influencer.userId,
                        type: "SYSTEM",
                        title: "Advance locked. Chat is now enabled.",
                        message: `The brand has paid the advance. Chat for ${contract.candidate?.campaign?.title || 'the campaign'} is now active.`,
                        link: "/creator/messages"
                    }
                });
                console.log(`[FUNDING_DEBUG] Notification sent to Influencer: ${contract.influencer.userId}`);
            }

            revalidatePath(`/brand/wallet`);
            revalidatePath(`/brand/campaigns`);
            return {
                success: true,
                contractId,
                newStatus: updatedContract.status,
                newWalletBalance: updatedWallet.balance
            };
        });
    } catch (error: any) {
        console.error("[FUNDING_DEBUG] TRANSACTION FAILED:", error.message);
        return { success: false, error: error.message || "Failed to fund contract" };
    }
}

// --- PAYOUT (MANUAL) ---
export async function manualPayout(
    campaignId: string,
    creatorId: string, // InfluencerProfile ID
    amount: number,
    method: "UPI" | "BANK",
    utr: string
) {
    const session = await getServerSession(authOptions);
    // Needs ADMIN or MANAGER role
    if (!session || !["ADMIN", "MANAGER"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.$transaction(async (tx) => {
            // 1. Verify Campaign/Creator exist
            // Check for duplicate payout (same UTR or total amount check)
            const existingPayout = await tx.payoutRecord.findFirst({
                where: {
                    campaignId,
                    creatorId,
                    utr // strict check on UTR to avoid double entry of same transaction
                }
            });

            if (existingPayout) {
                throw new Error("Payout with this UTR already recorded.");
            }

            // Optional: Check if total payouts exceed contract amount? 
            // Good for safety, but maybe partials are allowed?
            // Let's stick to UTR uniqueness for now unless user asked for balance check.
            // User said "Prevent duplicate payout records for same contract/campaign".

            // 2. Create Payout Record
            await tx.payoutRecord.create({
                data: {
                    campaignId,
                    creatorId,
                    amount,
                    method,
                    utr,
                    processedBy: session.user.id
                }
            });
        });

        revalidatePath(`/manager/campaigns`);
        return { success: true };
    } catch (error: any) {
        console.error("Payout Error:", error);
        return { success: false, error: error.message };
    }
}

// --- APPROVAL & FINAL LOCK ---
export async function approveDeliverableAndLock(contractId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MANAGER"].includes(session.user?.role as string)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        return await db.$transaction(async (tx) => {
            const contract = await tx.contract.findUnique({
                where: { id: contractId },
                include: {
                    brand: true,
                    candidate: true
                }
            });
            if (!contract) throw new Error("Contract not found");

            // Check if already approved/locked
            // Logic: "If remaining amount not yet locked: Deduct... Record FINAL_LOCK"
            // How do we know remaining amount?
            // contract.totalAmount - (ADVANCE_LOCK amount)
            // We can query WalletTransactions for this campaign/contract.

            const locks = await tx.walletTransaction.findMany({
                where: {
                    reference: contract.id,
                    wallet: { brandId: contract.brandId }
                }
            });

            const lockedAmount = locks.reduce((sum, t) => sum + t.amount, 0);
            const remaining = contract.totalAmount - lockedAmount;

            if (remaining > 0) {
                // Lock remaining
                const wallet = await tx.brandWallet.findUnique({
                    where: { brandId: contract.brandId }
                });

                if (!wallet || wallet.balance < remaining) {
                    throw new Error(`Insufficient brand wallet balance for final lock. Required: ${remaining}`);
                }

                await tx.brandWallet.update({
                    where: { id: wallet.id },
                    data: { balance: { decrement: remaining } }
                });

                await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: "FINAL_LOCK",
                        amount: remaining,
                        campaignId: contract.candidate?.campaignId,
                        reference: contract.id,
                        status: "SUCCESS"
                    }
                });
            }

            // Update Deliverable Status (if linked to one, or just contract)
            // Here we assume contract-level approval or we need deliverable ID.
            // "On manager APPROVAL" -> usually approves a submission.

            await tx.contract.update({
                where: { id: contractId },
                data: { status: "COMPLETED" } // or similar
            });

            // Update candidate status
            if (contract.candidateId) {
                await tx.campaignCandidate.update({
                    where: { id: contract.candidateId },
                    data: { status: "COMPLETED" }
                });
            }

            return { success: true };
        });
    } catch (error: any) {
        console.error("Approval Error:", error);
        return { success: false, error: error.message };
    }
}
