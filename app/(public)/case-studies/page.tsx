
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import Link from "next/link"

const caseStudies = [
    {
        id: 1,
        title: "Launch of TechGizmo X1",
        brand: "TechGizmo",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800&h=600",
        category: "Tech & Gadgets",
        results: {
            roi: "450%",
            reach: "2.5M",
            sales: "₹120k+"
        },
        description: "How TechGizmo leveraged micro-influencers to drive pre-orders for their flagship X1 model.",
        testimonial: '"The ROI on this campaign was incredible. Book My Influencers made it easy to find the right tech enthusiasts."'
    },
    {
        id: 2,
        title: "Summer Collection Reveal",
        brand: "VogueVibe",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800&h=600",
        category: "Fashion",
        results: {
            roi: "320%",
            reach: "1.8M",
            sales: "₹85k+"
        },
        description: "VogueVibe partnered with fashion lifestyle creators to showcase their eco-friendly summer line.",
        testimonial: '"Our brand awareness skyrocketed. The engagement rates were double what we get with traditional ads."'
    },
    {
        id: 3,
        title: "Healthy Eats Challenge",
        brand: "NutriLife",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800&h=600",
        category: "Health & Fitness",
        results: {
            roi: "280%",
            reach: "3.2M",
            sales: "₹95k+"
        },
        description: "A 30-day challenge campaign involving 15 fitness influencers promoting NutriLife supplements.",
        testimonial: '"Authentic content driven real conversions. We are definitely renewing for next quarter."'
    }
]

export default function CaseStudiesPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero */}
            <div className="bg-slate-900 py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <Badge className="bg-blue-600 mb-4 hover:bg-blue-700">Success Stories</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Real Brands. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Real Results.</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        See how leading brands are using Book My Influencers to scale their reach and drive sales through authentic creator partnerships.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {caseStudies.map((study) => (
                        <div key={study.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-slate-100 flex flex-col">
                            <div className="relative h-64 w-full">
                                <Image
                                    src={study.image}
                                    alt={study.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                                    {study.brand}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-sm font-semibold text-blue-600 mb-2">{study.category}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{study.title}</h3>
                                <p className="text-slate-600 text-sm mb-6 flex-1">
                                    {study.description}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-100 mb-6 bg-slate-50/50 rounded-lg p-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-slate-900">{study.results.roi}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">ROI</div>
                                    </div>
                                    <div className="text-center border-l border-slate-200">
                                        <div className="text-lg font-bold text-slate-900">{study.results.reach}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Reach</div>
                                    </div>
                                    <div className="text-center border-l border-slate-200">
                                        <div className="text-lg font-bold text-slate-900">{study.results.sales}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Sales</div>
                                    </div>
                                </div>

                                <div className="italic text-slate-500 text-sm mb-6">
                                    {study.testimonial}
                                </div>

                                <Button className="w-full bg-slate-900 hover:bg-slate-800" asChild>
                                    <Link href="/brand/campaigns/new">
                                        Duplicate Strategy <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="max-w-7xl mx-auto px-6 mt-20 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to write your success story?</h2>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 border-0" asChild>
                    <Link href="/register">Start Your Campaign</Link>
                </Button>
            </div>
        </div>
    )
}
