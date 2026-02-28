'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/features/cart/cartStore';
import { fetchRecommendations } from '@/services/recommendation-service';
import { tracker } from '@/lib/tracker';

export const useRecommendations = () => {
    const { items } = useCartStore();
    const cartItemIds = useMemo(() => items.map(i => i.id), [items]);

    const [isOffline, setIsOffline] = useState(false);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const {
        data,
        isLoading,
        error,
        refetch,
        isStale,
        status
    } = useQuery({
        queryKey: ['recommendations', cartItemIds],
        queryFn: () => fetchRecommendations(cartItemIds),
        staleTime: 120000, // 2 minutes
        gcTime: 300000,   // 5 minutes
        retry: (failureCount, error: any) => {
            // Don't retry for 4xx errors
            if (error?.status >= 400 && error?.status < 500) return false;
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // 1. Filter out items already in cart
    // 2. Filter out dismissed items
    // 3. Ensure we have fallback items if list is empty
    const recommendations = useMemo(() => {
        if (!data?.recommendations) return [];

        return data.recommendations.filter(item =>
            !cartItemIds.includes(item.id) &&
            !dismissedIds.includes(item.id)
        );
    }, [data, cartItemIds, dismissedIds]);

    const dismissRecommendation = (id: string) => {
        tracker.track('recommendation_dismiss', { itemId: id });
        setDismissedIds(prev => [...prev, id]);
    };

    return {
        recommendations,
        title: data?.title || 'Complete your meal',
        isLoading, // Hide loading if we have stale data
        error,
        isOffline,
        isStale,
        refetch,
        dismissRecommendation
    };
};
