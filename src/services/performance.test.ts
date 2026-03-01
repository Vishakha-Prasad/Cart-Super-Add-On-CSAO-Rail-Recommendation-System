import { fetchRecommendations } from './recommendation-service';
import { describe, test, expect } from 'vitest';

describe('Performance & Caching', () => {
    test('should serve results from "Server-side" Redis Cache for empty cart', async () => {
        // Initial fetch to populate
        await fetchRecommendations([]);

        const startTime = performance.now();
        await fetchRecommendations([]);
        const duration = performance.now() - startTime;

        // Caching should be faster than the 800ms mock delay
        expect(duration).toBeLessThan(100);
    });

    test('should deduplicate concurrent requests for the same cart', async () => {
        const p1 = fetchRecommendations(['1', '2']);
        const p2 = fetchRecommendations(['1', '2']);

        expect(p1).toBe(p2);
        await p1;
    });
});
