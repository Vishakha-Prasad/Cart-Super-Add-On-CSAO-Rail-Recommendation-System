import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/features/cart/cartStore';
import { MOCK_ITEMS } from '@/hooks/use-restaurant';
import { fetchRecommendations } from '@/services/recommendation-service';

describe('Integration: Menu & Cart Flow', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
    });

    it('should have the correct new menu items', () => {
        const itemNames = MOCK_ITEMS.map((i: any) => i.name);
        expect(itemNames).toContain('Veg Hakka Noodles');
        expect(itemNames).toContain('Gobi Manchurian');
        expect(itemNames).toContain('Jalebi');
        expect(itemNames).toContain('Laddoo');
    });

    it('should add items to cart and calculate totals correctly', () => {
        const hakkaNoodles = MOCK_ITEMS.find((i: any) => i.name === 'Veg Hakka Noodles')!;
        useCartStore.getState().addItem({
            id: hakkaNoodles.id,
            name: hakkaNoodles.name,
            price: hakkaNoodles.price,
            quantity: 1
        });

        const state = useCartStore.getState();
        expect(state.items.length).toBe(1);
        expect(state.getSubtotal()).toBe(hakkaNoodles.price);
        expect(state.getTax()).toBe(hakkaNoodles.price * 0.05);
    });

    it('should suggest Gobi Manchurian when Veg Hakka Noodles is in cart', async () => {
        const hakkaNoodles = MOCK_ITEMS.find((i: any) => i.name === 'Veg Hakka Noodles')!;
        const gobiManchurian = MOCK_ITEMS.find((i: any) => i.name === 'Gobi Manchurian')!;

        // Add Hakka Noodles to cart
        useCartStore.getState().addItem({
            id: hakkaNoodles.id,
            name: hakkaNoodles.name,
            price: hakkaNoodles.price,
            quantity: 1
        });

        // Get recommendations for the cart
        const cartItemIds = [hakkaNoodles.id];
        const result = await fetchRecommendations(cartItemIds);

        // Check if Gobi Manchurian is in recommendations with the specific title
        expect(result.title).toBe('The Perfect Pair!');
        const recNames = result.recommendations.map((r: any) => r.name);
        expect(recNames).toContain('Gobi Manchurian');
    });
});
