'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ShieldCheck,
    Lock,
    BadgeCheck,
    FileText,
    QrCode,
    CreditCard,
    Landmark,
    CheckCircle,
    Shield,
    ArrowRight,
    Info,
    Loader2
} from 'lucide-react';
import { fundEscrowTransaction } from '../actions';
import { Contract, InfluencerProfile, User, Deliverable, BrandProfile } from '@prisma/client';

type FullContract = Contract & {
    influencer: InfluencerProfile & { user: User };
    brand: BrandProfile;
    deliverables: Deliverable[];
};

interface CheckoutClientProps {
    contract: FullContract;
}

export default function CheckoutClient({ contract }: CheckoutClientProps) {
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaid, setIsPaid] = useState(contract.status !== 'DRAFT' && contract.status !== 'PENDING_ESCROW');

    const subtotal = contract.totalAmount - contract.taxAmount - contract.platformFee;

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate network delay for UX
        await new Promise(r => setTimeout(r, 1500));

        const result = await fundEscrowTransaction(contract.id);

        setIsProcessing(false);
        if (result.success) {
            setIsPaid(true);
            alert("Payment Successful! Escrow Account Funded.");
        } else {
            alert("Payment Failed: " + result.error);
        }
    };

    if (isPaid) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
                    <p className="text-gray-600 mb-6">The funds have been securely deposited into escrow. The contract is now active.</p>
                    <Link href="/brand/campaigns">
                        <button className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition">
                            Go to Campaign Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex w-10 h-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900">InfluenceHub</h1>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Lock className="w-3 h-3 fill-current" /> Secure Checkout
                            </span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        SSL Encrypted Connection
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Booking Summary */}
                    <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Booking Summary</h2>
                            <p className="text-gray-500">Review the deliverable details before proceeding with payment.</p>
                        </div>

                        {/* Card: Influencer & Service */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            {/* Influencer Header */}
                            <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 ring-2 ring-white shadow-md relative overflow-hidden">
                                            <Image
                                                src={contract.influencer.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"}
                                                alt={contract.influencer.user.name || 'User'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 flex w-6 h-6 items-center justify-center rounded-full bg-white text-green-600 shadow-sm ring-1 ring-gray-100">
                                            <BadgeCheck className="w-4 h-4 fill-current" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{contract.influencer.user.name}</h3>
                                        <p className="text-sm font-medium text-gray-500">{contract.influencer.instagramHandle} • {contract.influencer.followers} Followers</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-600">
                                        Validated Profile
                                    </span>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-xs font-semibold uppercase text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Service</th>
                                            <th className="px-6 py-4">Timeline</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {contract.deliverables.length > 0 ? (
                                            contract.deliverables.map((d, i) => (
                                                <tr key={i}>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-bold text-gray-900">{d.title}</span>
                                                            <span className="text-gray-500">{d.description || 'Deliverable'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-gray-600 align-top">
                                                        {d.dueDate ? new Date(d.dueDate).toLocaleDateString() : 'TBD'}
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-bold text-gray-900 align-top">
                                                        -
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="px-6 py-5" colSpan={3}>No specific deliverables listed properly.</td>
                                            </tr>
                                        )}

                                        <tr>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-gray-900">Content Strategy Call</span>
                                                    <span className="text-gray-500">30 min kickoff call</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-600 align-top">
                                                Immediate
                                            </td>
                                            <td className="px-6 py-5 text-right font-bold text-gray-900 align-top">
                                                Included
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Contract Link */}
                            <div className="border-t border-gray-100 bg-gray-50 p-4">
                                <button className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                                    <FileText className="w-4 h-4" />
                                    View Escrow Agreement {contract.candidateId && `#${contract.candidateId.substring(0, 8)}`}
                                </button>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Platform Fee</span>
                                    <span>₹{contract.platformFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>GST / Tax</span>
                                    <span>₹{contract.taxAmount.toLocaleString()}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
                                    <span className="text-lg font-bold text-gray-900">Total Due</span>
                                    <span className="text-2xl font-bold text-teal-600">₹{contract.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Secure Payment */}
                    <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Secure Payment</h2>
                            <p className="text-gray-500">Select payment method.</p>
                        </div>

                        <div className="relative flex flex-col rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
                            {/* Payment Methods Tabs */}
                            <div className="grid grid-cols-3 gap-1 p-2 bg-gray-50 rounded-t-2xl border-b border-gray-100">
                                <button
                                    onClick={() => setPaymentMethod('upi')}
                                    className={`flex flex-col items-center justify-center gap-1 rounded-lg py-3 transition-all ${paymentMethod === 'upi' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:bg-white hover:text-gray-900'
                                        }`}
                                >
                                    <QrCode className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-teal-600' : ''}`} />
                                    <span className={`text-xs font-bold ${paymentMethod === 'upi' ? 'text-gray-900' : ''}`}>UPI</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`flex flex-col items-center justify-center gap-1 rounded-lg py-3 transition-all ${paymentMethod === 'card' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:bg-white hover:text-gray-900'
                                        }`}
                                >
                                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-teal-600' : ''}`} />
                                    <span className={`text-xs font-bold ${paymentMethod === 'card' ? 'text-gray-900' : ''}`}>Card</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('netbanking')}
                                    className={`flex flex-col items-center justify-center gap-1 rounded-lg py-3 transition-all ${paymentMethod === 'netbanking' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:bg-white hover:text-gray-900'
                                        }`}
                                >
                                    <Landmark className={`w-6 h-6 ${paymentMethod === 'netbanking' ? 'text-teal-600' : ''}`} />
                                    <span className={`text-xs font-bold ${paymentMethod === 'netbanking' ? 'text-gray-900' : ''}`}>NetBanking</span>
                                </button>
                            </div>

                            {/* Payment Body */}
                            <div className="p-6 flex flex-col items-center gap-6">
                                {paymentMethod === 'upi' && (
                                    <>
                                        <div className="relative group">
                                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-500 to-blue-400 opacity-20 blur transition duration-200 group-hover:opacity-40"></div>
                                            <div className="relative flex flex-col items-center rounded-xl bg-white p-4 border border-gray-100">
                                                {/* QR Code Placeholder */}
                                                <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center text-white mb-2">
                                                    <QrCode className="w-24 h-24 opacity-50" />
                                                </div>
                                                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    Scan with any UPI app
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gray-200"></div>
                                            <span className="text-xs font-medium text-gray-400">OR PAY TO VPA</span>
                                            <div className="h-px flex-1 bg-gray-200"></div>
                                        </div>

                                        <div className="w-full">
                                            <label className="sr-only">UPI ID</label>
                                            <div className="relative">
                                                <input className="w-full rounded-lg border-gray-300 bg-gray-50 py-3 pl-4 pr-10 text-sm focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none border" placeholder="example@okhdfcbank" type="text" />
                                                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-600 font-bold text-xs hover:bg-teal-50 px-2 py-1 rounded transition-colors">
                                                    VERIFY
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {paymentMethod !== 'upi' && (
                                    <div className="py-12 text-center text-gray-500 text-sm">
                                        <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        Payment method integration coming soon.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Escrow Guarantee Badge */}
                        <div className="mx-6 mb-6 rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-900">100% Escrow Protection</h4>
                                    <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
                                        Your funds are held securely in a trust account. Payment is only released to the influencer once you approve the final content.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="p-6 pt-0">
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-teal-600 px-6 py-4 text-white shadow-lg shadow-teal-600/30 transition-all hover:bg-teal-700 hover:shadow-teal-600/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="relative z-10 text-lg font-bold">Confirm & Pay ₹{contract.totalAmount.toLocaleString()}</span>
                                        <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                                {/* Shine effect */}
                                {!isProcessing && <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>}
                            </button>

                            <p className="mt-4 text-center text-[11px] text-gray-400">
                                By clicking Pay, you agree to the InfluenceHub <Link href="/legal" className="underline hover:text-teal-600">Terms of Service</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer decoration (abstract shape) */}
            <div className="fixed -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-teal-600/5 blur-3xl"></div>
            <div className="fixed -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-green-500/5 blur-3xl"></div>
        </div>
    );
}
