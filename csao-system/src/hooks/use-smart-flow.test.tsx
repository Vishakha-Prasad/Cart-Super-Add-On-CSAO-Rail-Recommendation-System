import { renderHook, act } from '@testing-library/react';
import { useSmartFlow } from './use-smart-flow';
import { useCartStore } from '@/features/cart/cartStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the smart engine
vi.mock('@/services/smart-engine', () => ({
    getRankedRecommendations: vi.fn(async (id: string, cartIds: string[]) => ({
        title: "Test Title",
        context: "Test Context",
        recommendations: [
            { id: '101', name: 'Item A', price: 100, category: 'Sides', image: '' },
            { id: '102', name: 'Item B', price: 200, category: 'Beverages', image: '' },
        ]
    }))
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useSmartFlow Hook', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
        queryClient.clear();
    });

    it('should initialize with the first suggestion', async () => {
        const { result } = renderHook(() => useSmartFlow('1'), { wrapper });

        // Wait for query to resolve
        await vi.waitFor(() => expect(result.current.suggestion).not.toBeNull());

        expect(result.current.suggestion?.name).toBe('Item A');
        expect(result.current.totalSuggestions).toBe(2);
    });

    it('should move to next suggestion on skip', async () => {
        const { result } = renderHook(() => useSmartFlow('1'), { wrapper });

        await vi.waitFor(() => expect(result.current.suggestion).not.toBeNull());

        act(() => {
            result.current.handleSkip();
        });

        expect(result.current.suggestion?.name).toBe('Item B');
        expect(result.current.hasMore).toBe(false);
    });

    it('should add item to cart on handleAddition', async () => {
        const { result } = renderHook(() => useSmartFlow('1'), { wrapper });

        await vi.waitFor(() => expect(result.current.suggestion).not.toBeNull());

        act(() => {
            result.current.handleAddition();
        });

        const cartItems = useCartStore.getState().items;
        expect(cartItems).toHaveLength(1);
        expect(cartItems[0].name).toBe('Item A');
    });
});
