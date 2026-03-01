import { fetchRecommendations } from './recommendation-service';
import { describe, test, expect } from 'vitest';

describe('Recommendation Logic', () => {
    test('should deduplicate identical concurrent requests', () => {
        const call1 = fetchRecommendations(['1', '2']);
        const call2 = fetchRecommendations(['1', '2']);
        expect(call1).toBe(call2);
    });

    test('should return different results for Hakka Noodles vs Default', async () => {
        const resDefault = await fetchRecommendations([]);
        const resNoodles = await fetchRecommendations(['16']);

        expect(resDefault.title).not.toBe(resNoodles.title);
        expect(resNoodles.title).toBe('The Perfect Pair!');
    });
});
