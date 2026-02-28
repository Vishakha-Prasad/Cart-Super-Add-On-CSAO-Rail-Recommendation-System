'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/features/cart/cartStore';

// Mock Recommendations Database
const RECOMMENDATION_POOL = [
    { id: 'rec_1', name: 'Thums Up (250ml)', price: 40, originalPrice: 50, rating: 4.5, category: 'Beverages', description: 'Refreshing cola.', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'rec_2', name: 'Virgin Mojito', price: 120, rating: 4.2, category: 'Beverages', description: 'Minty refreshment.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'rec_3', name: 'Roasted Papad', price: 20, rating: 4.8, category: 'Sides', description: 'Crispy lentil cracker.', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4709a?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'rec_4', name: 'Extra Butter', price: 30, rating: 4.9, category: 'Add-ons', description: 'Chilled Amul butter.', image: 'https://images.unsplash.com/photo-1589985273302-70887e3d537f?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'rec_5', name: 'Gulab Jamun (1pc)', price: 45, originalPrice: 60, rating: 4.7, category: 'Desserts', description: 'Traditional sweet.', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'rec_6', name: 'Mint Chutney', price: 10, rating: 4.4, category: 'Add-ons', description: 'Spicy mint dip.', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'rec_7', name: 'Chocolate Brownie', price: 150, rating: 4.6, category: 'Desserts', description: 'Warm and fudgy.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=200&h=200' },
];

export const useRecommendations = () => {
    const cartItems = useCartStore((state) => state.items);
    const [debouncedCartIds, setDebouncedCartIds] = useState<string[]>([]);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    // Debounce cart changes by 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedCartIds(cartItems.map(item => item.id));
        }, 500);
        return () => clearTimeout(handler);
    }, [cartItems]);

    const dismissRecommendation = (id: string) => {
        setDismissedIds(prev => [...prev, id]);
    };

    const query = useQuery({
        queryKey: ['recommendations', debouncedCartIds, dismissedIds],
        queryFn: async () => {
            // Simulate API delay
            await new Promise(r => setTimeout(r, 600));

            // Logic: Suggest items NOT in cart and NOT dismissed
            let suggested = RECOMMENDATION_POOL.filter(item =>
                !debouncedCartIds.includes(item.id) &&
                !dismissedIds.includes(item.id)
            );

            // Contextual filtering: If cart has main course, prioritize drinks and desserts
            const hasMainCourse = cartItems.some(i => i.price > 200);
            if (hasMainCourse) {
                suggested.sort((a, b) => {
                    const aIsAddon = a.category === 'Beverages' || a.category === 'Desserts';
                    const bIsAddon = b.category === 'Beverages' || b.category === 'Desserts';
                    if (aIsAddon && !bIsAddon) return -1;
                    if (!aIsAddon && bIsAddon) return 1;
                    return 0;
                });
            }

            return {
                title: hasMainCourse ? "Complete your meal" : "You might also like",
                items: suggested
            };
        },
        enabled: cartItems.length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    return {
        ...query,
        dismissRecommendation
    };
};
