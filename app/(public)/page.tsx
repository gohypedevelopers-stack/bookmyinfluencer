import Image from 'next/image';
import Link from 'next/link';
import { Search, TrendingUp, Shield, Users, Zap, CheckCircle2, Star, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Header/Navbar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                            Bookmyinfluencer
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-gray-600 hover:text-teal-600 transition">Features</Link>
                        <Link href="#how-it-works" className="text-gray-600 hover:text-teal-600 transition">How It Works</Link>
                        <Link href="#pricing" className="text-gray-600 hover:text-teal-600 transition">Pricing</Link>
                        <Link href="/login" className="text-gray-600 hover:text-teal-600 transition">Sign In</Link>
                        <Link
                            href="/login"
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 font-medium"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                            <TrendingUp className="w-4 h-4" />
                            Join 10k+ active creators
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            The Most Trusted Bridge Between{' '}
                            <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                                Brands & Creators
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed">
                            We connect top talent influencers to professional brand deals.
                            Secure payments, verified creators, and seamless collaboration.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/login"
                                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 font-semibold text-center group"
                            >
                                Start Now
                                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="px-8 py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-all duration-300 font-semibold text-center"
                            >
                                Learn More
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-white" />
                                ))}
                            </div>
                            <div className="text-sm text-gray-600">
                                <div className="font-semibold text-gray-900">50k+ Collaborations</div>
                                <div>Successfully completed</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 bg-white rounded-2xl shadow-xl p-6 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl mb-4" />
                                    <div className="h-4 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                </div>
                            </div>
                        </div>

                        {/* Floating stats */}
                        <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-bounce-slow">
                            <div className="text-2xl font-bold text-teal-600">₹2.5M+</div>
                            <div className="text-sm text-gray-600">Paid to creators</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-gradient-to-br from-gray-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Leaders Choose Us</h2>
                        <p className="text-xl text-gray-600">We provide the safest, fastest, and most professional brand deals.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: 'Verified Creators',
                                description: 'All influencers undergo thorough verification including KYC and social media authentication.',
                                color: 'from-blue-500 to-blue-600'
                            },
                            {
                                icon: Zap,
                                title: 'Smart Escrow',
                                description: 'Payments held securely until deliverables are approved. Safe for both parties.',
                                color: 'from-purple-500 to-purple-600'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Real-time Analytics',
                                description: 'Track campaign performance, engagement rates, and ROI with our advanced dashboard.',
                                color: 'from-pink-500 to-pink-600'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Trending Talent */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Top Trending Talent</h2>
                    <Link href="/discover" className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2">
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { name: 'Sarah M.', category: 'Fashion', followers: '2.5M', engagement: '8.5%', bg: 'from-pink-400 to-pink-600' },
                        { name: 'Alex T.', category: 'Tech', followers: '1.2M', engagement: '6.2%', bg: 'from-blue-400 to-blue-600' },
                        { name: 'Maya K.', category: 'Lifestyle', followers: '850K', engagement: '7.8%', bg: 'from-purple-400 to-purple-600' },
                        { name: 'John D.', category: 'Fitness', followers: '1.8M', engagement: '9.1%', bg: 'from-teal-400 to-teal-600' }
                    ].map((talent, idx) => (
                        <div key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <div className={`h-48 bg-gradient-to-br ${talent.bg} relative`}>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                    {talent.category}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{talent.name}</h3>
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {talent.followers}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        {talent.engagement}
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all font-medium">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="bg-gradient-to-br from-teal-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Streamlined Workflow</h2>
                        <p className="text-xl text-gray-600">From discovery to payout in three simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: 1, title: 'Discover & Filter', description: 'Browse thousands of verified creators using our advanced filters for niche, location, and engagement.' },
                            { step: 2, title: 'Chat & Negotiate', description: 'Discuss campaign details in our secure Trio-Chat with escrow admin oversight for your protection.' },
                            { step: 3, title: 'Track & Release', description: 'Monitor deliverables in real-time. Funds released automatically upon campaign completion.' }
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-teal-500/30">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-12 text-center text-white shadow-2xl">
                    <h2 className="text-4xl font-bold mb-4">Ready to scale your influence?</h2>
                    <p className="text-xl text-teal-50 mb-8">Join thousands of creators earning through verified brand collaborations</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white text-teal-600 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
                        >
                            Create Account
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-4 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-all duration-300 font-semibold"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white">Bookmyinfluencer</span>
                            </div>
                            <p className="text-gray-400 text-sm">Connecting brands with verified creators worldwide.</p>
                        </div>

                        {[
                            { title: 'Product', links: ['Features', 'Pricing', 'Security'] },
                            { title: 'Company', links: ['About', 'Blog', 'Careers'] },
                            { title: 'Support', links: ['Help Center', 'Contact', 'Terms'] }
                        ].map((col, idx) => (
                            <div key={idx}>
                                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                                <ul className="space-y-2">
                                    {col.links.map((link) => (
                                        <li key={link}>
                                            <Link href="#" className="text-gray-400 hover:text-teal-400 transition text-sm">
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                        © 2026 Bookmyinfluencer. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
