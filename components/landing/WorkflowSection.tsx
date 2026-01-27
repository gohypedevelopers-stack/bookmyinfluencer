
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"

export function WorkflowSection() {
    return (
        <section className="w-full py-24 bg-white text-center">
            <Container>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Streamlined Workflow</h2>
                <p className="text-lg text-slate-600 mb-12">A process designed for speed and security.</p>

                {/* Toggle (Visual only for landing) */}
                <div className="inline-flex bg-slate-100 p-1 rounded-full mb-16">
                    <button className="px-6 py-2 rounded-full bg-white text-slate-900 font-medium shadow-sm text-sm">I'm a Brand</button>
                    <button className="px-6 py-2 rounded-full text-slate-500 font-medium hover:text-slate-900 text-sm">I'm a Creator</button>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10" />

                    {[
                        { step: "1", title: "Search & Filter", desc: "Use advanced filters to find the perfect creator match based on niche, engagement rate, and location." },
                        { step: "2", title: "Negotiate & Fund", desc: "Agree on terms directly via our chat. Deposit funds safely into escrow to start the project." },
                        { step: "3", title: "Approve & Release", desc: "Review the content. Once satisfied, release the payment to the creator instantly." },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-50 mb-8 z-10">
                                <span className="text-3xl font-bold text-blue-600">{item.step}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                            <p className="text-slate-600 max-w-xs mx-auto leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
