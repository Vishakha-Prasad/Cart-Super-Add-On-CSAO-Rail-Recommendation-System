'use client';

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import { useRecommendations } from '@/features/recommendations/useRecommendations';
import { useCartStore } from '@/features/cart/cartStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Helper to wrap hooks in the necessary provider
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 0,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } >
        { children }
        </QueryClientProvider>
    );
};

describe('useRecommendations Hook', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
    });

    test('should return loading status initially', async () => {
        const { result } = renderHook(() => useRecommendations(), {
            wrapper: createWrapper()
        });
        expect(result.current.status).toBeDefined();
    });

    test('should not suggest items already in cart', async () => {
        const item = { id: 'rec_1', name: 'Thums Up', price: 40, quantity: 1 };
        useCartStore.getState().addItem(item);

        const { result } = renderHook(() => useRecommendations(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 3000 });

        const suggestedIds = result.current.data?.items.map((i: any) => i.id) || [];
        expect(suggestedIds).not.toContain('rec_1');
    });

    test('should dismiss recommendations correctly', async () => {
        const { result } = renderHook(() => useRecommendations(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.data?.items.length).toBeGreaterThan(0);
        }, { timeout: 3000 });

        const idToDismiss = result.current.data?.items[0].id;
        const initialCount = result.current.data?.items.length;

        result.current.dismissRecommendation(idToDismiss);

        await waitFor(() => {
            const currentIds = result.current.data?.items.map((r: any) => r.id) || [];
            expect(currentIds).not.toContain(idToDismiss);
        }, { timeout: 3000 });
    });

    test('should change title when main course is in cart', async () => {
        useCartStore.getState().addItem({ id: 'main', name: 'Butter Chicken', price: 350, quantity: 1 });

        const { result } = renderHook(() => useRecommendations(), {
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.data?.title).toBe('Complete your meal');
        }, { timeout: 3000 });
    });
});
