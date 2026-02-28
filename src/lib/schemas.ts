import { z } from 'zod';

/**
 * Recommendation Item Schema
 */
export const RecommendationItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    rating: z.number().min(0).max(5),
    category: z.string(),
    description: z.string(),
    image: z.string().url(),
});

/**
 * Recommendation API Response Schema
 */
export const RecommendationResponseSchema = z.object({
    recommendations: z.array(RecommendationItemSchema),
    title: z.string(),
    context: z.string().optional(),
});

export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
