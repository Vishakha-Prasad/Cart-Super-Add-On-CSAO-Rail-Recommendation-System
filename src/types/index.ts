import { z } from 'zod';

export const CartItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
});

export const RecommendationSchema = z.object({
    id: z.string(),
    title: z.string(),
    items: z.array(CartItemSchema),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
