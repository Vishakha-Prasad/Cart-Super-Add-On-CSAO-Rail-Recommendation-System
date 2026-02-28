import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const RecommendationSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
});

type Recommendation = z.infer<typeof RecommendationSchema>;

export const useRecommendations = (cartItemIds: string[]) => {
    return useQuery({
        queryKey: ['recommendations', cartItemIds],
        queryFn: async () => {
            const { data } = await axios.get('/api/recommendations', {
                params: { ids: cartItemIds.join(',') },
            });
            return z.array(RecommendationSchema).parse(data);
        },
        enabled: cartItemIds.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
