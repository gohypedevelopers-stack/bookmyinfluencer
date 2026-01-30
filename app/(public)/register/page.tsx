'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, Camera, Layers, Instagram, Youtube } from 'lucide-react';
import { registerUserAction } from './actions';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        primaryPlatform: '',
        instagramUrl: '',
        youtubeUrl: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.agreeToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        // Call server action to register user
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, value.toString());
        });

        try {
            await registerUserAction(formDataObj);
            alert('Registration successful! Please login.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const platforms = [
        { value: '', label: 'Select Platform' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'facebook', label: 'Facebook' },
    ];

    return (
        <div className="h-screen w-full flex overflow-hidden">
            {/* Left Side - Visual branding with purple gradient */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a78bfa] p-12 flex-col justify-between relative overflow-hidden shrink-0">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-20">
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                            <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                            <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            <g transform="translate(200, 200)">
                                <ellipse cx="0" cy="-30" rx="25" ry="60" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                                <path d="M0,-90 Q-30,-60 0,-30 Q30,-60 0,-90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                                <line x1="0" y1="0" x2="0" y2="60" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                                <ellipse cx="-20" cy="10" rx="15" ry="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" transform="rotate(-30)" />
                                <ellipse cx="20" cy="10" rx="15" ry="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" transform="rotate(30)" />
                            </g>
                            <text fill="rgba(255,255,255,0.3)" fontSize="14" fontFamily="serif">
                                <textPath href="#circlePath" startOffset="0%">
                                    MINIMAL NATURAL • BRAND •
                                </textPath>
                            </text>
                            <defs>
                                <path id="circlePath" d="M 200,200 m -130,0 a 130,130 0 1,1 260,0 a 130,130 0 1,1 -260,0" />
                            </defs>
                            <text x="100" y="120" fill="rgba(255,255,255,0.2)" fontSize="24" fontFamily="serif">B</text>
                            <text x="280" y="140" fill="rgba(255,255,255,0.2)" fontSize="24" fontFamily="serif">A</text>
                            <text x="320" y="220" fill="rgba(255,255,255,0.2)" fontSize="24" fontFamily="serif">N</text>
                            <text x="290" y="300" fill="rgba(255,255,255,0.2)" fontSize="24" fontFamily="serif">D</text>
                        </svg>
                    </div>
                </div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-white tracking-wide">CREATOR HUB</span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Turn your content<br />
                            into a <span className="text-[#2dd4bf]">career.</span>
                        </h1>
                        <p className="text-lg text-white/80 max-w-md leading-relaxed">
                            Join 50,000+ creators landing deals with global brands daily. Everything you need to manage your business in one place.
                        </p>
                    </div>
                </div>

                {/* Bottom Feature Cards */}
                <div className="relative z-10">
                    <div className="border-t border-white/20 pt-8">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-[#2dd4bf] rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-[#1a1a2e]" />
                                </div>
                                <h3 className="text-sm font-semibold text-white">Get Verified</h3>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Boost your credibility with our official badge.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-[#2dd4bf] rounded-lg flex items-center justify-center">
                                    <Camera className="w-4 h-4 text-[#1a1a2e]" />
                                </div>
                                <h3 className="text-sm font-semibold text-white">Secure Payments</h3>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Escrow protection for every single collab.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-[#2dd4bf] rounded-lg flex items-center justify-center">
                                    <Layers className="w-4 h-4 text-[#1a1a2e]" />
                                </div>
                                <h3 className="text-sm font-semibold text-white">Direct Brand Deals</h3>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    No middlemen, just you and the brands.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 h-full overflow-y-auto bg-gray-50">
                <div className="min-h-full flex items-center justify-center p-6">
                    <div className="w-full max-w-md py-6">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                                <Layers className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">CREATOR HUB</span>
                        </div>

                        <div className="space-y-5">
                            {/* Header */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
                                <p className="text-sm text-gray-600">Start your journey as a marketplace creator today.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Full Name */}
                                <div>
                                    <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                                        required
                                    />
                                </div>

                                {/* Mobile Number & Primary Platform Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="mobileNumber" className="block text-xs font-medium text-gray-700 mb-1">
                                            Mobile Number
                                        </label>
                                        <input
                                            id="mobileNumber"
                                            name="mobileNumber"
                                            type="tel"
                                            placeholder="+1(555) 000-0000"
                                            value={formData.mobileNumber}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="primaryPlatform" className="block text-xs font-medium text-gray-700 mb-1">
                                            Primary Social Platform
                                        </label>
                                        <select
                                            id="primaryPlatform"
                                            name="primaryPlatform"
                                            value={formData.primaryPlatform}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                                            required
                                        >
                                            {platforms.map(platform => (
                                                <option key={platform.value} value={platform.value}>
                                                    {platform.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Instagram Profile URL */}
                                <div>
                                    <label htmlFor="instagramUrl" className="block text-xs font-medium text-gray-700 mb-1">
                                        Instagram Profile URL
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="instagramUrl"
                                            name="instagramUrl"
                                            type="url"
                                            placeholder="instagram.com/yourhandle"
                                            value={formData.instagramUrl}
                                            onChange={handleInputChange}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                                        />
                                    </div>
                                </div>

                                {/* YouTube Channel URL */}
                                <div>
                                    <label htmlFor="youtubeUrl" className="block text-xs font-medium text-gray-700 mb-1">
                                        YouTube Channel URL
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Youtube className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="youtubeUrl"
                                            name="youtubeUrl"
                                            type="url"
                                            placeholder="youtube.com/@channel"
                                            value={formData.youtubeUrl}
                                            onChange={handleInputChange}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@creator.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="agreeToTerms"
                                        name="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onChange={handleInputChange}
                                        className="mt-0.5 w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                    />
                                    <label htmlFor="agreeToTerms" className="text-xs text-gray-600 cursor-pointer">
                                        By signing up, I agree to the{' '}
                                        <Link href="/terms" className="text-purple-600 hover:underline font-medium">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="text-purple-600 hover:underline font-medium">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        'Join as a Creator'
                                    )}
                                </button>
                            </form>

                            {/* Login Link */}
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="text-purple-600 font-semibold hover:underline">
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
