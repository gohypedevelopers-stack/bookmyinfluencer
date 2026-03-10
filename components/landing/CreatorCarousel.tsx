'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

interface CreatorCarouselProps {
    creators: any[];
}

export function CreatorCarousel({ creators }: CreatorCarouselProps) {
    if (!creators || creators.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full"
        >
            <Swiper
                modules={[Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                loop={true}
                speed={1000}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                    1280: {
                        slidesPerView: 4,
                    },
                }}
                className="pb-12"
            >
                {creators.map((creator) => {
                    const metric = creator.metrics?.[0];
                    const selfMetric = creator.selfReportedMetrics?.[0];

                    const followers = metric?.followersCount || selfMetric?.followersCount || 0;
                    const engagement = metric?.engagementRate || 0;

                    const fmtFollowers = followers > 1000000
                        ? `${(followers / 1000000).toFixed(1)}M`
                        : followers > 1000
                            ? `${(followers / 1000).toFixed(1)}K`
                            : followers.toString();

                    const displayName = creator.displayName || creator.fullName || (creator.user as any)?.name || "Influencer";
                    // @ts-ignore
                    const imageSrc = creator.profileImageUrl || (creator.user as any)?.image || creator.backgroundImageUrl;

                    return (
                        <SwiperSlide key={creator.id}>
                            <Link href={`/creators/${creator.id}`} className="block h-full transition-all duration-500">
                                <div className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer border border-slate-200 bg-white group shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-200">
                                    {imageSrc ? (
                                        <Image
                                            src={imageSrc}
                                            alt={displayName}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                                    )}

                                    {/* Premium Overlay - Light Mode Refined */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-black/5 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all duration-500" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                        <div className="flex items-center gap-1.5 mb-1.5 transform group-hover:-translate-y-1 transition-transform duration-500">
                                            <h3 className="font-extrabold text-xl text-slate-900 tracking-tight truncate max-w-[85%]">{displayName}</h3>
                                            <BadgeCheck className="w-5 h-5 text-indigo-600 drop-shadow-sm flex-shrink-0" />
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium mb-5 truncate group-hover:text-slate-900 transition-colors">{creator.niche || 'General Content'}</p>

                                        <div className="flex items-center justify-between text-xs font-bold border-t border-slate-100 pt-4 group-hover:border-slate-200 transition-colors">
                                            <div className="space-y-1">
                                                <p className="text-slate-500 uppercase tracking-tighter">Followers</p>
                                                <p className="text-slate-900 text-sm font-black">{fmtFollowers}</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-slate-500 uppercase tracking-tighter">Engagement</p>
                                                <p className="text-indigo-600 text-sm font-black">{engagement.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Glow Indicator */}
                                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </motion.div>
    );
}
