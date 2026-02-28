import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRecommendations } from '@/features/recommendations/useRecommendations';
import { useCartStore } from '@/features/cart/cartStore';
import { describe, test, expect, beforeEach } from 'vitest';

// Create a fresh wrapper for each test to avoid cache bleed
function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
        },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRecommendations Hook', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
    });

    test('should not suggest items already in cart', async () => {
        // Add item to cart BEFORE rendering the hook
        useCartStore.getState().addItem({ id: 'rec_1', name: 'Thums Up', price: 40, quantity: 1 });

        const { result } = renderHook(() => useRecommendations(), {
            wrapper: createWrapper(),
        });

        // Wait for debounce (500ms) + simulated API delay (600ms) to resolve
        await waitFor(
            () => expect(result.current.isSuccess).toBe(true),
            { timeout: 3000, interval: 200 }
        );

        const suggestedIds = result.current.data!.items.map((i: any) => i.id);
        expect(suggestedIds).not.toContain('rec_1');
    });

    test('should dismiss recommendations correctly', async () => {
        useCartStore.getState().addItem({ id: '1', name: 'Butter Chicken', price: 350, quantity: 1 });

        const { result } = renderHook(() => useRecommendations(), {
            wrapper: createWrapper(),
        });

        await waitFor(
            () => expect(result.current.isSuccess).toBe(true),
            { timeout: 3000, interval: 200 }
        );

        const idToDismiss = result.current.data!.items[0].id;

        act(() => {
            result.current.dismissRecommendation(idToDismiss);
        });

        // After dismiss, the query re-fetches with updated dismissedIds
        await waitFor(() => {
            const ids = result.current.data!.items.map((i: any) => i.id);
            expect(ids).not.toContain(idToDismiss);
        }, { timeout: 3000, interval: 200 });
    });

    test('should update title based on context', async () => {
        // Add an expensive item (price > 200) to trigger "Complete your meal"
        useCartStore.getState().addItem({ id: 'main', name: 'Large Pizza', price: 500, quantity: 1 });

        const { result } = renderHook(() => useRecommendations(), {
            wrapper: createWrapper(),
        });

        await waitFor(
            () => expect(result.current.isSuccess).toBe(true),
            { timeout: 3000, interval: 200 }
        );

        expect(result.current.data!.title).toBe('Complete your meal');
    });
});
