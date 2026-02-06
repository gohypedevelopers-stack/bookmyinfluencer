'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, CheckCircle2, ChevronRight, Download, FileText, HelpCircle, LifeBuoy, Lock, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPaymentSuccessData } from '@/app/brand/actions';
import Confetti from 'react-confetti';

export default function PaymentSuccessPage() {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [showConfetti, setShowConfetti] = useState(true);
    const searchParams = useSearchParams();
    const contractId = searchParams.get('contractId');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        const timer = setTimeout(() => setShowConfetti(false), 5000);

        if (contractId) {
            getPaymentSuccessData(contractId).then(res => {
                if (res.success) setData(res.data);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }

        return () => clearTimeout(timer);
    }, [contractId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-50/30">Loading...</div>;

    return (
        <div className="min-h-screen bg-green-50/30 flex items-center justify-center p-4">
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

            <div className="w-full max-w-5xl grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Success Header */}
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                                <Check className="w-8 h-8 text-white stroke-[3]" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Payment Confirmed & Escrow Initialized</h1>
                        <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">
                            Your funds are securely held. The influencer has been notified to begin work on your campaign. <span className="inline-block align-middle"><ShieldCheck className="w-4 h-4 text-green-500 ml-1" /></span>
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Transaction Info */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Transaction Summary</h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                                        <p className="font-bold text-gray-900 tracking-wide">#{data?.transactionId?.slice(-8).toUpperCase() || "PENDING"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Campaign / Service</p>
                                        <p className="font-bold text-gray-900">{data?.serviceTitle || "Direct Hire"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                        <div className="font-bold">₹</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                        <p className="font-bold text-gray-900 text-xl">₹{data?.amount?.toLocaleString() || "0.00"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">What's Next?</h3>

                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gray-100"></div>

                                <div className="relative flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10 ring-4 ring-white">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Influencer Notification</p>
                                        <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">Active • Notification Sent</p>
                                    </div>
                                </div>

                                <div className="relative flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center z-10 ring-4 ring-white">
                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                    </div>
                                    <div className="opacity-50">
                                        <p className="font-bold text-gray-900 text-sm">Content Creation</p>
                                        <p className="text-xs text-gray-500">Pending influencer action</p>
                                    </div>
                                </div>

                                <div className="relative flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center z-10 ring-4 ring-white">
                                        <Lock className="w-3 h-3 text-gray-400" />
                                    </div>
                                    <div className="opacity-50">
                                        <p className="font-bold text-gray-900 text-sm">Review & Approval</p>
                                        <p className="text-xs text-gray-500">Locked until submission</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Link href="/brand/dashboard" className="flex-1">
                            <Button className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200 text-lg transition-all hover:scale-[1.01]">
                                Go to Campaign Dashboard
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        </Link>
                        <Link href="/brand/messages" className="flex-1">
                            <Button variant="outline" className="w-full h-14 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-900 rounded-2xl font-bold text-lg transition-all">
                                <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
                                Open Trio-Chat
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card className="p-6 rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <Download className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Payment Invoice</h4>
                        <p className="text-xs text-gray-500">Download PDF receipt for your records.</p>
                    </Card>

                    <Card className="p-6 rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
                                <LifeBuoy className="w-5 h-5" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Need Help?</h4>
                        <p className="text-xs text-gray-500">Contact our support team for any billing questions.</p>
                    </Card>

                    <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-green-600 fill-green-600" />
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Pro Tip</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                            You can add more influencers to this campaign at any time from your dashboard to scale up your reach.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

