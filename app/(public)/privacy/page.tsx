export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6">
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
                <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Privacy Policy</h1>

                <div className="space-y-8 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Data Collection</h2>
                        <p>We collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Use of Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, and to connect influencers with relevant brand opportunities.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. Data Sharing</h2>
                        <p>We do not share your personal information with third parties except as described in this policy, such as with brands when you apply for a campaign.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. Security</h2>
                        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
                    </section>

                    <section className="pt-8 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-400">Last updated: March 2026</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
