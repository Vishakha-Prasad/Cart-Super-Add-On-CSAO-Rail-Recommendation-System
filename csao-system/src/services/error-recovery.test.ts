import { fetchRecommendations } from './recommendation-service';
import { describe, test, expect } from 'vitest';

describe('Error Recovery & Resilience', () => {
    test('should NOT suggest items already in the cart (conflict filtering)', async () => {
        const cartItems = ['rec_1', 'rec_2'];
        const result = await fetchRecommendations(cartItems);

        const overlap = result.items.filter(r => cartItems.includes(r.id));
        expect(overlap.length).toBe(0);
    });

    test('should provide a default title when cart is empty', async () => {
        const result = await fetchRecommendations([]);
        expect(result.title).toBe('You might also like');
    });
});
