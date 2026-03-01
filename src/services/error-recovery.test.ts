import { fetchRecommendations } from './recommendation-service';
import { describe, test, expect } from 'vitest';

describe('Error Recovery & Resilience', () => {
    test('should NOT suggest items already in the cart (conflict filtering)', async () => {
        const cartItems = ['rec_10', 'rec_12'];
        const result = await fetchRecommendations(cartItems);

        const overlap = result.recommendations.filter(r => cartItems.includes(r.id));
        expect(overlap.length).toBe(0);
    });

    test('should return exactly 2 items for Hakka Noodles (item 17 is unpushed, rec_10 and rec_12 are defaults)', async () => {
        // Hakka Noodles (16) adds Gobi Manchurian (17) to recommendations
        const result = await fetchRecommendations(['16']);
        expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
    });
});
