
import { Shield, Lock, MessageSquare } from "lucide-react"
import { Container } from "@/components/container"

export function FeaturesSection() {
    return (
        <section className="w-full py-24 bg-white">
            <Container className="text-center">
                {/* Trusted By - Inline here or separate. Design puts it above or part of this section. I'll put it above this block but inside the section for flow. */}
                <div className="mb-24">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">As Featured In</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
                        <h3 className="text-2xl font-serif font-bold text-slate-700">VOGUE</h3>
                        <h3 className="text-2xl font-serif font-bold text-slate-700">TechCrunch</h3>
                        <h3 className="text-2xl font-serif font-bold text-slate-700 tracking-tight">WIRED</h3>
                        <h3 className="text-2xl font-serif font-bold text-slate-700 italic">Forbes</h3>
                        <h3 className="text-2xl font-serif font-bold text-slate-700">ADWEEK</h3>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Leaders Choose Us</h2>
                    <p className="text-lg text-slate-600">We provide the safety infrastructure for professional partnerships.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Shield,
                            title: "Verified Creators",
                            desc: "Every influencer undergoes strict KYC identity checks and audience quality auditing.",
                            color: "bg-blue-50 text-blue-600"
                        },
                        {
                            icon: Lock,
                            title: "Secure Escrow",
                            desc: "Funds are held safely in escrow until deliverables are approved by the brand.",
                            color: "bg-purple-50 text-purple-600"
                        },
                        {
                            icon: MessageSquare,
                            title: "Trio-Chat System",
                            desc: "Direct negotiation channels with admin moderation available for dispute resolution.",
                            color: "bg-pink-50 text-pink-600"
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
