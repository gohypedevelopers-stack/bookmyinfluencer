'use client';

import { useState } from 'react';
import { submitKYC } from './actions';
import { KYCStatus } from '@prisma/client';
import { ShieldCheck, Upload, AlertCircle } from 'lucide-react';

export default function KYCClient({ influencerId, currentStatus }: { influencerId: string, currentStatus: KYCStatus }) {
    const [pan, setPan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (currentStatus === 'APPROVED') {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm">
                <ShieldCheck className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Verified</h2>
                <p className="text-gray-500">Your profile is fully verified. You can now access all features.</p>
            </div>
        );
    }

    if (currentStatus === 'PENDING') {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-yellow-50 rounded-xl border border-yellow-200">
                <ClockIcon className="w-16 h-16 text-yellow-600 mb-4" />
                <h2 className="text-2xl font-bold text-yellow-800">Under Review</h2>
                <p className="text-yellow-600">Our team is reviewing your documents. Check back soon.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Mocking file upload handling by just taking strings
        const res = await submitKYC(influencerId, { panCard: pan, documentType: 'PAN' });
        setIsSubmitting(false);
        if (res.success) {
            // Force refresh usually handled by router.refresh() in parent or useTransition, but simplified here
            window.location.reload();
        } else {
            alert("Submission failed");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Complete KYC</h2>
            <p className="text-gray-500 mb-6">Verify your identity to start earning.</p>

            {currentStatus === 'REJECTED' && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Previous submission was rejected. Please try again.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">PAN Card Number</label>
                    <input
                        type="text"
                        value={pan}
                        onChange={e => setPan(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="ABCDE1234F"
                        required
                    />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm">Upload Front of ID (Mock)</span>
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                </button>
            </form>
        </div>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
