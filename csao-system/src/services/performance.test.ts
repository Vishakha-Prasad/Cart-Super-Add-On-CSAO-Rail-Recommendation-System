import { fetchRecommendations } from './recommendation-service';
import { describe, test, expect } from 'vitest';

describe('Performance Layer', () => {
    test('should serve cached results for empty cart after first fetch', async () => {
        await fetchRecommendations([]);

        const startTime = performance.now();
        await fetchRecommendations([]);
        const duration = performance.now() - startTime;

        expect(duration).toBeLessThan(100);
    });

    test('should maintain single flight for concurrent identical requests', () => {
        const p1 = fetchRecommendations(['1', '2']);
        const p2 = fetchRecommendations(['1', '2']);
        expect(p1).toBe(p2);
    });
});
