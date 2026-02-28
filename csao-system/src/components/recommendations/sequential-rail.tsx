'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronRight, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { useSmartFlow } from '@/hooks/use-smart-flow';
import { useCartStore } from '@/features/cart/cartStore';
import { cn } from '@/lib/utils';

interface SequentialRailProps {
    firstItemId: string | null;
}

export const SequentialRail = ({ firstItemId }: SequentialRailProps) => {
    const {
        suggestion,
        title,
        context,
        isLoading,
        isError,
        handleSkip,
        handleAddition,
        hasMore,
        totalSuggestions
    } = useSmartFlow(firstItemId);

    const itemsInCart = useCartStore(state => state.items.length);

    if (isLoading) {
        return (
            <div className="p-6 bg-muted/20 rounded-2xl animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mb-4" />
                <div className="h-32 w-full bg-muted rounded-xl" />
            </div>
        );
    }

    if (!suggestion || isError) return null;

    return (
        <section className="py-6 px-1">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {title}
                    </h3>
                    {context && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{context}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    <span>{totalSuggestions} items available</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative bg-white rounded-2xl border border-border overflow-hidden shadow-sm p-4"
                >
                    <div className="flex gap-4">
                        {/* Item Image */}
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            <Image
                                src={suggestion.image}
                                alt={suggestion.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    <Star className="w-2 h-2 fill-current inline mr-0.5" />
                                    {suggestion.rating}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold truncate text-foreground">{suggestion.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{suggestion.description}</p>
                            <span className="text-sm font-bold">₹{suggestion.price}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleSkip}
                            className="flex-1 px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted/50 rounded-xl transition-colors border border-transparent"
                        >
                            Next Suggestion
                        </button>
                        <button
                            onClick={handleAddition}
                            className="flex-[1.5] px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add to Cart
                        </button>
                    </div>

                    {/* Sequential Progress */}
                    {totalSuggestions > 1 && (
                        <div className="absolute top-2 right-2 flex gap-1">
                            <div className="h-1 w-8 bg-primary rounded-full" />
                            <div className="h-1 w-4 bg-muted rounded-full" />
                            <div className="h-1 w-2 bg-muted rounded-full" />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </section>
    );
};
