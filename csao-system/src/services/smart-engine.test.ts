import { describe, it, expect } from 'vitest';
import { getRankedRecommendations } from './smart-engine';

describe('SmartRecommendationEngine: Scoring Logic', () => {
    it('should prioritize North Indian Breads when North Indian Main is added', async () => {
        // ID 1 is Butter Chicken (North Indian, Main)
        const result = await getRankedRecommendations('1');

        expect(result.title).toBe('Freshly Baked Breads');
        const topSuggestion = result.recommendations[0];
        expect(topSuggestion.name).toBe('Garlic Naan');
        expect(topSuggestion.cuisine).toBe('North Indian');
    });

    it('should prioritize Indo-Chinese Appetizers when Indo-Chinese Main is added', async () => {
        // ID 16 is Veg Hakka Noodles (Indo-Chinese, Main)
        const result = await getRankedRecommendations('16');

        const recNames = result.recommendations.map(r => r.name);
        expect(recNames).toContain('Gobi Manchurian');
        const manchurian = result.recommendations.find(r => r.name === 'Gobi Manchurian')!;
        expect(manchurian.cuisine).toBe('Indo-Chinese');
    });

    it('should suggest desserts for a spicy main course', async () => {
        // ID 6 is Chicken Biryani (North Indian, Main)
        // Note: Biryani usually scores high for desserts/beverages in our logic
        const result = await getRankedRecommendations('6');

        const recCategories = result.recommendations.map(r => r.category);
        expect(recCategories).toContain('Desserts');
        expect(recCategories).toContain('Breads');
    });

    it('should suggest beverages to complement main courses', async () => {
        // ID 12 is Chicken Tikka Masala
        const result = await getRankedRecommendations('12');

        const recNames = result.recommendations.map(r => r.name);
        expect(recNames).toContain('Mango Lassi');
        expect(recNames).toContain('Garlic Naan');
    });

    it('should exclude items already in the cart', async () => {
        // Add Butter Chicken (1), already has Naan (4) in cartIds
        const result = await getRankedRecommendations('1', ['4']);

        const recNames = result.recommendations.map(r => r.name);
        expect(recNames).not.toContain('Garlic Naan');
    });

    it('should provide fallback title for general recommendations', async () => {
        // Non-existent item or item with no metadata
        const result = await getRankedRecommendations('999');
        expect(result.title).toBe('Popular choices');
        expect(result.recommendations.length).toBeGreaterThan(0);
    });
});
