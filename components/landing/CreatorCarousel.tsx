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
                loop={creators.length >= 8}
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

                                    {/* Subtle Dark Gradient to make white text readable while keeping image sharp */}
                                    <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end">
                                        {/* Name Block - Hidden on Hover */}
                                        <div className="grid grid-rows-[1fr] group-hover:grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[0.25,1,0.5,1]">
                                            <div className="overflow-hidden opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                                <div className="flex items-center gap-1.5 pb-1">
                                                    <h3 className="font-bold text-lg sm:text-xl text-white tracking-tight truncate max-w-[85%] drop-shadow-lg">{displayName}</h3>
                                                    <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 drop-shadow-md flex-shrink-0" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Smooth Reveal Details */}
                                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[0.25,1,0.5,1]">
                                            <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                <div className="pt-1 pb-1">
                                                    <p className="text-xs sm:text-sm text-slate-200 font-medium mb-4 sm:mb-5 truncate drop-shadow-md">{creator.niche || 'General Content'}</p>

                                                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold border-t border-slate-700/60 pt-3 sm:pt-4">
                                                        <div className="space-y-1">
                                                            <p className="text-slate-300 uppercase tracking-tighter">Followers</p>
                                                            <p className="text-white text-xs sm:text-sm font-black">{fmtFollowers}</p>
                                                        </div>
                                                        <div className="text-right space-y-1">
                                                            <p className="text-slate-300 uppercase tracking-tighter">Engagement</p>
                                                            <p className="text-blue-400 text-xs sm:text-sm font-black">{engagement.toFixed(1)}%</p>
                                                        </div>
                                                    </div>
                                                </div>
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
