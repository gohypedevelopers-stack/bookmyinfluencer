export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6">
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
                <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Terms and Conditions</h1>

                <div className="space-y-8 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                        <p>Welcome to BookMyInfluencer. By accessing our website, you agree to these terms and conditions. Please read them carefully before using our platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Use of Service</h2>
                        <p>Our platform connects brands and influencers for marketing campaigns. You must be at least 18 years old to create an account and participate in collaborations.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
                        <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your sole responsibility.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. Content Guidelines</h2>
                        <p>All content posted on our platform must be authentic and comply with advertising standards. Misleading or harmful content is strictly prohibited.</p>
                    </section>

                    <section className="pt-8 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-400">Last updated: March 2026</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
