'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShieldCheck, IndianRupee } from 'lucide-react';
import { activateCampaignPayment } from '@/app/brand/campaigns/flow-actions';

export default function PaymentClient({ campaignId, amount }: { campaignId: string, amount: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        // Simulate payment gateway delay
        await new Promise(r => setTimeout(r, 2000));

        // Finalize in DB
        const res = await activateCampaignPayment(campaignId);
        
        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/brand/campaigns');
            }, 2500);
        } else {
            alert('Payment failed. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Payment Successful!</h2>
                    <p className="text-gray-500 mt-2">Your campaign is now fully funded and ready for execution by our Project Managers.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700">
                    Redirecting to Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Secure Checkout</h2>
                    <p className="text-xs text-gray-500">100% Upfront Platform Payment</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Total Amount</p>
                    <p className="text-4xl font-black text-gray-900 flex items-center gap-1">
                        <IndianRupee className="w-8 h-8" strokeWidth={3} />
                        {amount.toLocaleString()}
                    </p>
                </div>

                <div className="space-y-3">
                    <p className="text-xs text-gray-500 text-center font-medium">By proceeding, you agree to our Terms of Service and authorize this payment.</p>
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            'Pay Securely'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

