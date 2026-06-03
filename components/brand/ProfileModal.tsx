"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Camera, Edit2, Save, LogOut, BarChart3, ShieldCheck,
    IndianRupee, Bell, Lock, ChevronRight, Sparkles, User
} from 'lucide-react';
import Image from 'next/image';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [twoFactorOn, setTwoFactorOn] = useState(false);

    const [profile, setProfile] = useState({
        name: 'Brand Manager',
        email: 'manager@brand.com',
        company: 'Acme Corp',
        role: 'Marketing Director',
        bio: 'Leading influencer campaigns and brand growth across Southeast Asia.'
    });

    const handleSave = () => setIsEditing(false);

    const stats = [
        { label: 'Active Campaigns', value: '12', icon: BarChart3, gradient: 'from-blue-500/10 to-indigo-500/10', border: 'border-indigo-100', icon_color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Brand Rating', value: '4.9', icon: ShieldCheck, gradient: 'from-emerald-500/10 to-teal-500/10', border: 'border-teal-100', icon_color: 'text-teal-500', bg: 'bg-teal-50' },
        { label: 'Total Spent', value: '₹1.2M', icon: IndianRupee, gradient: 'from-violet-500/10 to-purple-500/10', border: 'border-purple-100', icon_color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const Field = ({ label, field }: { label: string; field: keyof typeof profile }) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</label>
            {isEditing ? (
                <input
                    value={profile[field]}
                    onChange={e => setProfile({ ...profile, [field]: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder-slate-300"
                />
            ) : (
                <p className="text-sm font-bold text-slate-800 px-1 py-1">{profile[field]}</p>
            )}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    style={{ background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)' }}
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 24 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-[640px] bg-white rounded-[28px] shadow-2xl shadow-slate-900/30 overflow-hidden flex flex-col"
                        style={{ maxHeight: 'min(92vh, 780px)' }}
                    >
                        {/* ── Banner ─────────────────────────────────── */}
                        <div className="relative h-36 shrink-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600" />
                            {/* floating orbs */}
                            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute bottom-0 left-8 w-32 h-32 rounded-full bg-indigo-300/20 blur-xl" />
                            {/* glitter sparkles */}
                            <div className="absolute top-5 right-20 text-white/40">
                                <Sparkles className="w-5 h-5 animate-pulse" />
                            </div>
                            {/* close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ── Avatar + header row ─────────────────────── */}
                        <div className="relative px-7 pt-3 pb-0 shrink-0">
                            <div className="flex items-end justify-between">
                                {/* avatar — positioned so it sits half on banner, half below */}
                                <div className="relative -mt-14 group">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-xl ring-2 ring-indigo-100">
                                        <Image
                                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200"
                                            alt="Profile"
                                            width={96}
                                            height={96}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    {isEditing && (
                                        <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-white">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                    {/* online dot */}
                                    <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                                </div>

                                {/* edit / save button */}
                                <div className="pb-1">
                                    {isEditing ? (
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:-translate-y-0.5 transition-all active:scale-95"
                                        >
                                            <Save className="w-4 h-4" /> Save Changes
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all active:scale-95"
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* name + role */}
                            <div className="mt-3 mb-5">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
                                <p className="text-sm font-semibold text-slate-500 mt-0.5">{profile.role} · {profile.company}</p>
                            </div>

                            {/* ── Tabs ─────────────────────────────────── */}
                            <div className="flex gap-1 p-1 bg-slate-100/80 rounded-2xl w-fit">
                                {(['profile', 'settings'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 capitalize ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="tab-bg"
                                                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200/50"
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">{tab === 'profile' ? 'Profile Details' : 'Settings'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Scrollable body ─────────────────────────── */}
                        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <AnimatePresence mode="wait">
                                {activeTab === 'profile' ? (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-5"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <Field label="Full Name" field="name" />
                                            <Field label="Email" field="email" />
                                            <Field label="Company" field="company" />
                                            <Field label="Role" field="role" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Bio</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={profile.bio}
                                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                                    rows={3}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-slate-600 leading-relaxed px-1 py-1">{profile.bio}</p>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Your Stats</h3>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {stats.map((s) => (
                                                    <div
                                                        key={s.label}
                                                        className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-4 text-center group hover:scale-105 hover:shadow-md transition-all duration-300 cursor-default`}
                                                    >
                                                        <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform`}>
                                                            <s.icon className={`w-5 h-5 ${s.icon_color}`} />
                                                        </div>
                                                        <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{s.value}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] mt-1.5">{s.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-3"
                                    >
                                        {/* Toggle row */}
                                        {[
                                            { icon: Bell, title: 'Email Notifications', desc: 'Receive alerts for new messages', on: notificationsOn, toggle: () => setNotificationsOn(v => !v), color: 'bg-indigo-600' },
                                            { icon: Lock, title: 'Two-Factor Auth', desc: 'Secure your brand account', on: twoFactorOn, toggle: () => setTwoFactorOn(v => !v), color: 'bg-emerald-500' },
                                        ].map(({ icon: Icon, title, desc, on, toggle, color }) => (
                                            <div key={title} className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center">
                                                        <Icon className="w-4.5 h-4.5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                                                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={toggle}
                                                    className={`relative w-12 h-6.5 rounded-full transition-all duration-300 shadow-inner focus:outline-none ${on ? color : 'bg-slate-200'}`}
                                                    style={{ height: '26px' }}
                                                >
                                                    <motion.div
                                                        animate={{ x: on ? 22 : 2 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                        className="absolute top-[3px] w-5 h-5 bg-white rounded-full shadow-md"
                                                    />
                                                </button>
                                            </div>
                                        ))}

                                        {/* navigation rows */}
                                        {[
                                            { label: 'Privacy & Data', desc: 'Manage your data preferences' },
                                            { label: 'Subscription & Billing', desc: 'View your current plan' },
                                        ].map(row => (
                                            <button key={row.label} className="w-full flex items-center justify-between p-4 bg-slate-50/80 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/30 hover:shadow-sm transition-all group text-left">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{row.label}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">{row.desc}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                            </button>
                                        ))}

                                        <div className="pt-2 border-t border-slate-100">
                                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-bold text-sm hover:bg-red-50 transition-colors group">
                                                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
