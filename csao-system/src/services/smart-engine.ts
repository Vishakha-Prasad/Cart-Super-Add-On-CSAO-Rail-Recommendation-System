'use client';

import { MOCK_ITEMS } from '@/hooks/use-restaurant';
import { RecommendationResponseSchema, type RecommendationResponse, type RecommendationItem } from '@/lib/schemas';

/**
 * Scoring Algorithm for Recommendations
 * Higher score = higher ranking
 */
const calculateScore = (contextItem: any, candidate: any): number => {
    let score = 0;

    // 1. Cuisine Match (+20)
    if (contextItem.cuisine && candidate.cuisine === contextItem.cuisine) {
        score += 20;
    }

    // 2. General Pairing Logic
    const contextTags = contextItem.pairingTags || [];
    const candidateTags = candidate.pairingTags || [];

    // Main -> Bread pairing (+26)
    if (contextTags.includes('main') && candidateTags.includes('bread')) {
        score += 26;
    }

    // Main -> Side pairing (+15)
    if (contextTags.includes('main') && candidateTags.includes('side')) {
        score += 15;
    }

    // Main -> Beverage pairing (+30)
    if (contextTags.includes('main') && candidateTags.includes('beverage')) {
        score += 30;
    }

    // Main -> Dessert pairing (+25)
    if (contextTags.includes('main') && candidateTags.includes('dessert')) {
        score += 25;
    }

    // Appetizer -> Side/Main pairing
    if (contextTags.includes('appetizer')) {
        if (candidateTags.includes('side')) score += 15;
        if (candidateTags.includes('main')) score += 10;
    }

    // Popularity Bonus
    if (candidate.isPopular) {
        score += 5;
    }

    return score;
};

/**
 * Get Ranked Recommendations based on the first item added
 */
export const getRankedRecommendations = async (
    firstItemId: string,
    cartItemIds: string[] = []
): Promise<RecommendationResponse> => {
    const contextItem = MOCK_ITEMS.find(item => item.id === firstItemId);

    if (!contextItem) {
        // Fallback to general popular items if context is missing
        return {
            title: "Popular choices",
            recommendations: MOCK_ITEMS
                .filter(item => item.isPopular && !cartItemIds.includes(item.id))
                .slice(0, 5) as RecommendationItem[]
        };
    }

    // Rank all eligible items
    const rankedItems = MOCK_ITEMS
        .filter(item => item.id !== firstItemId && !cartItemIds.includes(item.id))
        .map(item => ({
            item,
            score: calculateScore(contextItem, item)
        }))
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score);

    const recommendations = rankedItems.map(entry => entry.item) as RecommendationItem[];

    let title = "The Perfect Addition";
    if (recommendations.length > 0) {
        const topItem = recommendations[0];
        if (topItem.category === 'Breads') title = "Freshly Baked Breads";
        if (topItem.category === 'Desserts') title = "Something Sweet?";
        if (topItem.category === 'Beverages') title = "Thirsty?";
    }

    return {
        title,
        recommendations: recommendations.slice(0, 10),
        context: `Because you added ${contextItem.name}`
    };
};
