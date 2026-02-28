'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Star, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useRecommendations } from '@/hooks/use-recommendations';
import { useTracking } from '@/components/providers/tracking-provider';
import { ExperimentRenderer } from '@/components/ab-test/experiment-renderer';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Toast, useToast } from '@/components/ui/toast';
import { useAnimations } from '@/components/providers/animation-provider';

interface RecommendationItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    category: string;
    description: string;
    image: string;
}

interface CSAOItemCardProps {
    item: RecommendationItem;
    onDismiss: (id: string) => void;
    trackImpression: (id: string, name: string, type: 'item' | 'recommendation') => void;
    trackClick: (target: string, category: string, extra?: Record<string, any>) => void;
}

const CSAOItemCard = ({ item, onDismiss, trackImpression, trackClick }: CSAOItemCardProps) => {
    const addItem = useCartStore((state: any) => state.addItem);
    const { flyToCart } = useAnimations();
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    trackImpression(item.id, item.name, 'recommendation');
                }
            },
            { threshold: 0.5 }
        );
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [item.id, item.name, trackImpression]);

    const handleAdd = (e: React.MouseEvent) => {
        trackClick(item.id, 'recommendation_add');
        flyToCart({ x: e.clientX, y: e.clientY }, item.image);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
        addItem({ ...item, quantity: 1 });
    };

    return (
        <motion.div
            ref={cardRef}
            layout
            data-track-id={item.id}
            data-track-category="recommendation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="flex-shrink-0 w-[160px] md:w-[180px] bg-white rounded border border-[#DFE1E6] p-3 flex flex-col group relative transition-all hover:shadow-subtle"
        >
            <button
                onClick={() => onDismiss(item.id)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-[#EBECF0] text-[#6B778C] opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>

            <div className="w-full aspect-square rounded overflow-hidden bg-[#F4F5F7] mb-3 relative border border-[#F4F5F7]">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    sizes="(max-width: 768px) 160px, 180px"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-[10px] bg-[#E3FCEF] text-[#006644] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                        <Star className="w-2 h-2 fill-current" /> {item.rating}
                    </span>
                </div>
                <h4 className="text-sm font-semibold text-[#172B4D] truncate mb-0.5">{item.name}</h4>
                <p className="text-[10px] text-[#6B778C] truncate mb-3">{item.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-bold text-[#172B4D]">₹{item.price}</span>
                <button
                    onClick={handleAdd}
                    className="p-1.5 bg-[#0052CC] rounded text-white shadow-sm hover:bg-[#0065FF] transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

const CSAORailContent = () => {
    const {
        recommendations,
        title,
        isLoading,
        error,
        isOffline,
        isStale,
        refetch,
        dismissRecommendation
    } = useRecommendations();

    const { trackImpression, trackClick } = useTracking();
    const { toast, showToast, hideToast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [pullProgress, setPullProgress] = useState(0);

    const handleDrag = (_: any, info: any) => {
        if (!isOffline && info.offset.y > 0) {
            setPullProgress(Math.min(info.offset.y / 100, 1));
        }
    };

    const handleDragEnd = (_: any, info: any) => {
        if (!isOffline && info.offset.y > 80) {
            refetch();
        }
        setPullProgress(0);
    };

    useEffect(() => {
        if (error && !isOffline) {
            showToast('Unable to refresh recommendations', 'error');
        }
    }, [error, isOffline, showToast]);

    if (isLoading) {
        return (
            <div className="py-6 space-y-4">
                <div className="h-6 w-40 bg-muted animate-pulse rounded ml-6" />
                <div className="flex gap-4 overflow-hidden px-6">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[160px] h-[240px] bg-muted animate-pulse rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0 && !isOffline && !isLoading) return null;

    return (
        <section className="py-6 overflow-hidden relative">
            {!isOffline && (
                <motion.div
                    style={{ height: pullProgress * 50 }}
                    className="flex items-center justify-center overflow-hidden bg-muted/30"
                >
                    <RefreshCw
                        className="w-4 h-4 text-primary animate-spin"
                        style={{ opacity: pullProgress }}
                    />
                </motion.div>
            )}

            <AnimatePresence>
                {isOffline && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-orange-50 px-6 py-2 flex items-center gap-2 border-b border-orange-100 overflow-hidden"
                    >
                        <WifiOff className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                            You're offline. Showing cached favorites.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="px-6 mb-4 flex items-center justify-between"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
            >
                <div className="flex items-center gap-2">
                    <ExperimentRenderer
                        id="rail_messaging"
                        control={
                            <h3 className="text-sm font-bold text-[#42526E] uppercase tracking-wider">
                                {isOffline ? 'Favorites for You' : title}
                            </h3>
                        }
                        variantA={
                            <h3 className="text-sm font-bold text-[#0052CC] uppercase tracking-wider">
                                Recommended add-ons
                            </h3>
                        }
                    />
                    {isStale && !isOffline && (
                        <div className="px-1.5 py-0.5 bg-[#EBECF0] text-[#6B778C] text-[8px] font-bold rounded uppercase">
                            Stale
                        </div>
                    )}
                </div>
                {!isOffline && (
                    <button
                        onClick={() => refetch()}
                        className="p-1.5 hover:bg-[#F4F5F7] rounded transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-[#6B778C]" />
                    </button>
                )}
            </motion.div>

            <div className="relative group">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-6 pb-2"
                >
                    <AnimatePresence mode="popLayout">
                        {recommendations.map((item: any) => (
                            <CSAOItemCard
                                key={item.id}
                                item={item}
                                onDismiss={dismissRecommendation}
                                trackImpression={trackImpression}
                                trackClick={trackClick}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

export const CSAORail = () => (
    <ErrorBoundary>
        <CSAORailContent />
    </ErrorBoundary>
);
