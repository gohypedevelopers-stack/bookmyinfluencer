'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LivePhotoCapture from "@/components/kyc/LivePhotoCapture";

interface KYCOnboardingClientProps {
    userId: string;
    existingKey: string | null;
}

export default function KYCOnboardingClient({ userId, existingKey }: KYCOnboardingClientProps) {
    const router = useRouter();
    const [uploadedKey, setUploadedKey] = useState<string | null>(existingKey);

    const handleSuccess = (key: string) => {
        setUploadedKey(key);
    };

    return (
        <div className="flex-1 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white py-3 px-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 text-[#2dd4bf] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <circle cx="12" cy="12" r="3" />
                            <circle cx="19" cy="12" r="2" opacity="0.5" />
                            <circle cx="5" cy="12" r="2" opacity="0.5" />
                            <circle cx="12" cy="19" r="2" opacity="0.5" />
                            <circle cx="12" cy="5" r="2" opacity="0.5" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900 tracking-tight">InfluencerSync</span>
                </div>
            </header>

            {/* Progress Bar Section */}
            <div className="w-full bg-white relative">
                <div className="max-w-4xl mx-auto px-6 pt-6 pb-2">
                    <div className="flex justify-between text-[10px] font-bold tracking-widest text-[#24b2a0] uppercase mb-2">
                        <span>Step 3 of 4</span>
                        <span className="text-gray-900">75% Complete</span>
                    </div>
                </div>
                <div className="w-full h-1 bg-gray-100 absolute bottom-0 left-0">
                    <div className="h-full w-3/4 bg-[#2dd4bf]" />
                </div>
            </div>

            <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center items-center">
                {!uploadedKey ? (
                    <div className="w-full max-w-md">
                        <div className="mb-10 text-center">
                            <div className="w-16 h-16 bg-teal-50 text-[#2dd4bf] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Identity Verification</h1>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Take a quick selfie to verify your identity. This helps us maintain a secure platform and builds trust with brands.
                            </p>
                        </div>

                        <LivePhotoCapture userId={userId} onUploadSuccess={handleSuccess} />
                    </div>
                ) : (
                    <div className="w-full max-w-md text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/10">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Selfie Captured!</h1>
                        <p className="text-gray-500 text-sm mb-10 leading-relaxed">
                            Your identity verification is being processed. You can now proceed to finalize your profile details.
                        </p>

                        <Button
                            onClick={() => router.push('/creator/onboarding/finalize')}
                            className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold text-lg rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
                        >
                            Finalize Profile
                            <ArrowRight className="w-5 h-5 ml-3" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
