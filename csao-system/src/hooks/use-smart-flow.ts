'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRankedRecommendations } from '@/services/smart-engine';
import { useCartStore } from '@/features/cart/cartStore';

/**
 * Hook to manage the sequential recommendation flow
 * "Add" or "Skip" to see the next best item
 */
export const useSmartFlow = (firstItemId: string | null) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
    const { addItem, items: cartItems } = useCartStore();

    // Get recommendations from the engine
    const { data, isLoading, isError } = useQuery({
        queryKey: ['smart-recommendations', firstItemId, cartItems.map(i => i.id).join(',')],
        queryFn: () => getRankedRecommendations(firstItemId!, cartItems.map(i => i.id)),
        enabled: !!firstItemId,
    });

    // Filter out items that have been skipped manually in this session
    const activeRecommendations = useMemo(() => {
        if (!data?.recommendations) return [];
        return data.recommendations.filter(item => !skippedIds.has(item.id));
    }, [data, skippedIds]);

    const currentSuggestion = activeRecommendations[currentIndex] || null;
    const hasMore = currentIndex < activeRecommendations.length - 1;

    /**
     * Skip the current suggestion and move to the next
     */
    const handleSkip = useCallback(() => {
        if (currentSuggestion) {
            setSkippedIds(prev => new Set(prev).add(currentSuggestion.id));
        }
    }, [currentSuggestion]);

    /**
     * Add the current suggestion to cart and move to next
     */
    const handleAddition = useCallback(() => {
        if (currentSuggestion) {
            addItem({
                id: currentSuggestion.id,
                name: currentSuggestion.name,
                price: currentSuggestion.price,
                quantity: 1,
                image: currentSuggestion.image
            });
        }
    }, [currentSuggestion, addItem]);

    /**
     * Reset the flow (e.g., when cart is cleared)
     */
    const resetFlow = useCallback(() => {
        setCurrentIndex(0);
        setSkippedIds(new Set());
    }, []);

    return {
        suggestion: currentSuggestion,
        title: data?.title || "Recommendations",
        context: data?.context,
        isLoading,
        isError,
        handleSkip,
        handleAddition,
        resetFlow,
        hasMore,
        totalSuggestions: activeRecommendations.length
    };
};
