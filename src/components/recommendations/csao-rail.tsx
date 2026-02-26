'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Star, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';
import { useCartStore } from '@/features/cart/cartStore';
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

/**
 * CSAOItemCard component for individual recommendation items.
 * Triggers Fly-to-Cart animation and haptic feedback on add.
 */
const CSAOItemCard = ({ item, onDismiss, trackImpression, trackClick }: CSAOItemCardProps) => {
    const addItem = useCartStore((state: any) => state.addItem);
    const { flyToCart } = useAnimations();
    const cardRef = useRef<HTMLDivElement>(null);

    // Impression tracking with Intersection Observer
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

        // Micro-interaction: Fly to cart
        flyToCart({ x: e.clientX, y: e.clientY }, item.image);

        // Haptic feedback
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-shrink-0 w-[160px] md:w-[200px] bg-white dark:bg-card rounded-2xl border p-3 flex flex-col group relative"
        >
            <button
                onClick={() => onDismiss(item.id)}
                className="absolute top-2 right-2 z-10 p-1 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>

            <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted mb-3 relative">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    sizes="(max-width: 768px) 160px, 200px"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded flex items-center gap-0.5 font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" /> {item.rating}
                    </span>
                </div>
                <h4 className="text-sm font-bold truncate mb-0.5 text-foreground">{item.name}</h4>
                <p className="text-[10px] text-muted-foreground truncate mb-2">{item.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">₹{item.price}</span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAdd}
                    className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                >
                    <Plus className="w-5 h-5" />
                </motion.button>
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

    // Show toast on transient errors
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
            {/* Pull to Refresh Indicator */}
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

            {/* Offline Banner */}
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
                            <h3 className="text-lg font-black text-foreground tracking-tight">
                                {isOffline ? 'Favorites for You' : title}
                            </h3>
                        }
                        variantA={
                            <h3 className="text-lg font-black text-primary tracking-tight">
                                Add-ons for you
                            </h3>
                        }
                    />
                    {isStale && !isOffline && (
                        <div className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-bold rounded uppercase">
                            Stale
                        </div>
                    )}
                </div>
                {!isOffline && (
                    <button
                        onClick={() => refetch()}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors"
                        title="Refresh recommendations"
                    >
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
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
                    {recommendations.length === 0 && isOffline && (
                        <div className="flex-1 text-center py-8 opacity-50 w-full">
                            <p className="text-xs">No favorites available offline</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Toast */}
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

/**
 * Root CSAORail component wrapped in ErrorBoundary.
 * Entry point for the Cart Super Add-On (CSAO) recommendation system.
 */
export const CSAORail = () => (
    <ErrorBoundary>
        <CSAORailContent />
    </ErrorBoundary>
);
