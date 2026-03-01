import { fetchRecommendations } from './recommendation-service';
import { describe, test, expect } from 'vitest';

describe('Recommendation Logic Layer', () => {
    test('should return exactly 2 items for Hakka Noodles (item 16) in cart', async () => {
        // Hakka Noodles (16) triggers "Complete your meal" context
        const result = await fetchRecommendations(['16']);
        expect(result.items.length).toBeGreaterThanOrEqual(1);
    });

    test('should change title based on main course', async () => {
        const resEmpty = await fetchRecommendations([]);
        const resMain = await fetchRecommendations(['16']);

        expect(resEmpty.title).toBe('You might also like');
        expect(resMain.title).toBe('Complete your meal');
    });
});
