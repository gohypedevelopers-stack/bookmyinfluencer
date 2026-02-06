'use client';
import { useState, useEffect, use } from 'react';
import { ArrowLeft, ShieldCheck, QrCode, CreditCard, Landmark, Check, Lock, ChevronRight, FileText as FileTextIcon, CheckCircle as CheckCircleIcon, ArrowRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCheckoutData, processDirectHire } from '@/app/brand/actions';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
    const [upiId, setUpiId] = useState('');
    const [data, setData] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [upiVerified, setUpiVerified] = useState(false);
    const [upiVerifying, setUpiVerifying] = useState(false);
    const [upiError, setUpiError] = useState('');

    useEffect(() => {
        getCheckoutData(unwrappedParams.id).then(res => {
            if (res.success && res.data) {
                setData(res.data);
                // Default to first service or a standard package
                const pricing = res.data.pricing || [];
                if (pricing.length > 0) setSelectedService(pricing[0]);
                else setSelectedService({ title: "Collaboration", price: 5000 }); // Default fallback
            }
            setLoading(false);
        });
    }, [unwrappedParams.id]);

    const handleVerifyUpi = async () => {
        setUpiError('');
        setUpiVerified(false);

        // Validate UPI ID format
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiId.trim()) {
            setUpiError('Please enter a UPI ID');
            return;
        }
        if (!upiRegex.test(upiId)) {
            setUpiError('Invalid UPI ID format');
            return;
        }

        setUpiVerifying(true);

        // Simulate UPI verification (in production, this would call a payment gateway API)
        setTimeout(() => {
            setUpiVerifying(false);
            setUpiVerified(true);
        }, 1500);
    };

    const handlePayment = async () => {
        if (!data || !selectedService) return;

        // For UPI payment, verify UPI ID first
        if (paymentMethod === 'UPI' && !upiVerified) {
            setUpiError('Please verify your UPI ID first');
            return;
        }

        setProcessing(true);

        const amount = selectedService.price || 0;
        const res = await processDirectHire(unwrappedParams.id, selectedService, amount);

        if (res.success) {
            router.push(`/brand/payment/success?contractId=${res.contractId}`);
        } else {
            alert("Payment Failed"); // Simple alert for now
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center">Influencer not found</div>;

    const basePrice = selectedService?.price || 0;
    const platformFee = basePrice * 0.05;
    const gst = basePrice * 0.18;
    const total = basePrice + platformFee + gst;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-gray-900 text-lg">InfluenceHub <span className="text-gray-400 font-normal text-sm ml-2 hidden md:inline-block">Secure Checkout</span></h1>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        SSL Encrypted Connection
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column: Summary */}
                    <div className="lg:col-span-7 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Summary</h2>
                            <p className="text-gray-500">Review the deliverable details before proceeding with payment.</p>
                        </div>

                        <Card className="p-6 border-gray-100 shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
                                        <img src={data.image || "https://i.pravatar.cc/150"} alt="Creator" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{data.name}</h3>
                                        <p className="text-sm text-gray-500">{data.handle} • {data.followers} Followers</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                    Validated Profile
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Service Selection - Simple Dropdown or List if multiple */}
                                {data.pricing && data.pricing.length > 0 && (
                                    <div className="mb-4">
                                        <Label className="mb-2 block text-xs font-bold text-gray-500 uppercase">Select Package</Label>
                                        <select
                                            className="w-full p-3 bg-gray-50 border rounded-lg font-medium"
                                            onChange={(e) => {
                                                const idx = parseInt(e.target.value);
                                                setSelectedService(data.pricing[idx]);
                                            }}
                                        >
                                            {data.pricing.map((p: any, i: number) => (
                                                <option key={i} value={i}>{p.title} - ₹{p.price}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Service Item */}
                                <div className="flex justify-between py-4 border-b border-gray-50">
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900">1x {selectedService?.title || "Service"}</p>
                                        <p className="text-sm text-gray-500">Includes story repost & usage rights (1 yr)</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold text-gray-900">₹{selectedService?.price?.toLocaleString() || 0}</p>
                                        <p className="text-xs text-gray-400">Delivery in 7 Days</p>
                                    </div>
                                </div>

                                {/* Included Item */}
                                <div className="flex justify-between py-4 border-b border-gray-50">
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900">Content Strategy Call</p>
                                        <p className="text-sm text-gray-500">30 min kickoff call</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold text-gray-900">Included</p>
                                        <p className="text-xs text-gray-400">Upon Hire</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="#" className="inline-flex items-center gap-2 text-indigo-600 text-sm font-bold mt-6 hover:underline">
                                <FileTextIcon className="w-4 h-4" />
                                View Escrow Agreement & SOW
                            </Link>
                        </Card>

                        <Card className="p-6 border-gray-100 shadow-sm rounded-2xl bg-white space-y-3">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span>₹{basePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                                <span>Platform Fee (5%)</span>
                                <span>₹{platformFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                                <span>GST (18%)</span>
                                <span>₹{gst.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center mt-4">
                                <span className="font-bold text-gray-900 text-lg">Total Due</span>
                                <span className="font-bold text-indigo-600 text-2xl">₹{total.toLocaleString()}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Payment */}
                    <div className="lg:col-span-5 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h2>
                            <p className="text-gray-500">Select payment method.</p>
                        </div>

                        <Card className="p-6 border-gray-100 shadow-lg rounded-2xl bg-white sticky top-24">
                            {/* Tabs */}
                            <div className="grid grid-cols-3 gap-2 mb-8 bg-gray-50 p-1 rounded-xl">
                                <button
                                    onClick={() => setPaymentMethod('UPI')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'UPI' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <QrCode className="w-5 h-5 mb-1.5" />
                                    UPI
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'CARD' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <CreditCard className="w-5 h-5 mb-1.5" />
                                    Card
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('NETBANKING')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'NETBANKING' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Landmark className="w-5 h-5 mb-1.5" />
                                    NetBanking
                                </button>
                            </div>

                            {/* Payment Form Content */}
                            <div className="min-h-[250px] flex flex-col items-center justify-center mb-6">
                                {paymentMethod === 'UPI' && (
                                    <div className="text-center w-full">
                                        <div className="bg-teal-700 p-8 rounded-2xl shadow-inner mb-4 inline-block relative group">
                                            <div className="bg-white p-4 rounded-xl">
                                                {/* Generate UPI QR Code */}
                                                <QRCodeSVG
                                                    value={`upi://pay?pa=merchant@upi&pn=${encodeURIComponent(data?.name || 'BookMyInfluencer')}&am=${total}&cu=INR&tn=${encodeURIComponent(`Payment for ${selectedService?.title || 'service'}`)}`}
                                                    size={128}
                                                    level="H"
                                                    includeMargin={false}
                                                />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-2xl backdrop-blur-sm">
                                                <p className="text-white font-bold text-xs">Scan to Pay ₹{total.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-gray-600 text-sm font-medium mb-6">
                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                            Scan with any UPI app
                                        </div>

                                        <div className="relative flex items-center w-full">
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                            <span className="px-3 text-xs font-bold text-gray-400 bg-white">OR PAY TO VPA</span>
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="example@okhdfcbank"
                                                    className={`bg-gray-50 border-gray-200 focus:bg-white transition-all font-medium text-sm h-11 ${upiVerified ? 'border-green-500 bg-green-50' : upiError ? 'border-red-500' : ''}`}
                                                    value={upiId}
                                                    onChange={(e) => {
                                                        setUpiId(e.target.value);
                                                        setUpiError('');
                                                        setUpiVerified(false);
                                                    }}
                                                    disabled={upiVerifying}
                                                />
                                                <Button
                                                    variant="outline"
                                                    className={`font-bold h-11 min-w-[100px] ${upiVerified
                                                        ? 'text-green-600 border-green-500 bg-green-50 hover:bg-green-100'
                                                        : 'text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-100'
                                                        }`}
                                                    onClick={handleVerifyUpi}
                                                    disabled={upiVerifying || upiVerified || !upiId}
                                                >
                                                    {upiVerifying ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Verifying...
                                                        </>
                                                    ) : upiVerified ? (
                                                        <>
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Verified
                                                        </>
                                                    ) : (
                                                        'VERIFY'
                                                    )}
                                                </Button>
                                            </div>
                                            {upiError && (
                                                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                    <X className="w-3 h-3" />
                                                    {upiError}
                                                </p>
                                            )}
                                            {upiVerified && (
                                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <Check className="w-3 h-3" />
                                                    UPI ID verified successfully
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Placeholders for other methods */}
                                {paymentMethod !== 'UPI' && (
                                    <div className="text-center text-gray-400">
                                        <Lock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Secure Payment Gateway</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-start gap-3 mb-6">
                                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-green-800 text-sm mb-1">100% Escrow Protection</h4>
                                    <p className="text-xs text-green-700 leading-relaxed">Your funds are held securely in a trust account. Payment is only released to the influencer once you approve the final content.</p>
                                </div>
                            </div>

                            <Button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full bg-[#1e4e5f] hover:bg-[#163a47] text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 group transition-all"
                            >
                                {processing ? "Processing..." : `Confirm & Pay ₹${total.toLocaleString()}`}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="flex justify-center gap-4 mt-6 opacity-30 grayscale">
                                {/* Icons for payment partners */}
                                <div className="w-8 h-5 bg-gray-800 rounded-sm"></div>
                                <div className="w-8 h-5 bg-gray-800 rounded-sm"></div>
                                <div className="w-8 h-5 bg-gray-800 rounded-sm"></div>
                            </div>

                            <p className="text-center text-[10px] text-gray-400 mt-4">By clicking Pay, you agree to the InfluenceHub <Link href="#" className="underline">Terms of Service</Link></p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

