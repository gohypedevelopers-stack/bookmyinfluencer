'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

interface CreatorCarouselProps {
    creators: any[];
}

export function CreatorCarousel({ creators }: CreatorCarouselProps) {
    if (!creators || creators.length === 0) return null;

    return (
        <div className="w-full">
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
                            <Link href={`/creators/${creator.id}`} className="block h-full transition-transform duration-300 hover:-translate-y-1">
                                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                                    {imageSrc ? (
                                        <Image
                                            src={imageSrc}
                                            alt={displayName}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                        <div className="flex items-center gap-1 mb-1">
                                            <h3 className="font-bold text-lg text-white truncate max-w-[85%]">{displayName}</h3>
                                            <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                        </div>
                                        <p className="text-sm text-slate-300 mb-3 truncate">{creator.niche || 'General Content'}</p>

                                        <div className="flex items-center justify-between text-xs font-medium border-t border-white/20 pt-3">
                                            <div>
                                                <p className="text-slate-400">Followers</p>
                                                <p>{fmtFollowers}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-slate-400">Engagement</p>
                                                <p className="text-green-400">{engagement.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
