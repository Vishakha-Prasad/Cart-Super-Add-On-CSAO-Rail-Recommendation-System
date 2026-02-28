'use client';

import React, { createContext, useContext, useEffect, useCallback, Suspense } from 'react';
import { tracker } from '@/lib/tracker';
import { usePathname, useSearchParams } from 'next/navigation';

interface TrackingContextType {
    trackClick: (target: string, category: string, extra?: Record<string, any>) => void;
    trackImpression: (id: string, name: string, type: 'item' | 'recommendation') => void;
    trackCartEvent: (action: 'add' | 'remove' | 'update' | 'clear', data: any) => void;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

const TrackingContent = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Track Page Views automatically
    useEffect(() => {
        tracker.track('page_view', {
            url: pathname,
            params: searchParams.toString(),
            title: document.title
        });
    }, [pathname, searchParams]);

    // Track scroll depth (simplistic implementation)
    useEffect(() => {
        let maxScroll = 0;
        const handleScroll = () => {
            const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    tracker.track('scroll_depth', { depth: maxScroll });
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const trackClick = useCallback((target: string, category: string, extra: Record<string, any> = {}) => {
        tracker.track('click', { target, category, ...extra });
    }, []);

    const trackImpression = useCallback((id: string, name: string, type: 'item' | 'recommendation') => {
        tracker.track('impression', { id, name, type });
    }, []);

    const trackCartEvent = useCallback((action: 'add' | 'remove' | 'update' | 'clear', data: any) => {
        tracker.track('cart_event', { action, ...data });
    }, []);

    return (
        <TrackingContext.Provider value={{ trackClick, trackImpression, trackCartEvent }}>
            {children}
        </TrackingContext.Provider>
    );
};

export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <Suspense fallback={null}>
            <TrackingContent>{children}</TrackingContent>
        </Suspense>
    );
};

export const useTracking = () => {
    const context = useContext(TrackingContext);
    if (!context) {
        throw new Error('useTracking must be used within a TrackingProvider');
    }
    return context;
};
