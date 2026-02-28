'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Mock Data
const CATEGORIES = [
    'Recommended',
    'Main Course',
    'Appetizers',
    'Breads',
    'Desserts',
    'Beverages'
];

export const MOCK_ITEMS = [
    { id: '1', name: 'Butter Chicken', price: 350, category: 'Main Course', isVeg: false, isPopular: true, description: 'Classic creamy tomato gravy with tender chicken pieces.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400&h=400', cuisine: 'North Indian', pairingTags: ['main'] },
    { id: '2', name: 'Paneer Tikka', price: 280, category: 'Appetizers', isVeg: true, isPopular: true, description: 'Marinated cottage cheese cubes grilled to perfection.', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=400&h=400', cuisine: 'North Indian', pairingTags: ['appetizer', 'side'] },
    { id: '3', name: 'Dal Makhani', price: 220, category: 'Main Course', isVeg: true, isPopular: false, description: 'Slow-cooked black lentils with cream and butter.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400&h=400', cuisine: 'North Indian', pairingTags: ['main', 'side'] },
    { id: '4', name: 'Garlic Naan', price: 60, category: 'Breads', isVeg: true, isPopular: true, description: 'Soft leavened bread with a buttery garlic glaze.', image: '/images/garlic_naan.jpg', cuisine: 'North Indian', pairingTags: ['bread'] }, // Image 2
    { id: '5', name: 'Gulab Jamun', price: 90, category: 'Desserts', isVeg: true, isPopular: true, description: 'Two pieces of traditional milk-solid based sweets syrup.', image: '/images/gulab_jamun.jpg', cuisine: 'North Indian', pairingTags: ['dessert'] }, // Image 1
    { id: '6', name: 'Chicken Biryani', price: 320, category: 'Main Course', isVeg: false, isPopular: true, description: 'Fragrant basmati rice cooked with spicy chicken and herbs.', image: '/images/chicken_biryani.jpg', cuisine: 'North Indian', pairingTags: ['main'] }, // Image 4
    { id: '7', name: 'Tandoori Chicken', price: 450, category: 'Appetizers', isVeg: false, isPopular: false, description: 'Whole chicken marinated in yogurt and spices, roasted in a clay oven.', image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=400&h=400', cuisine: 'North Indian', pairingTags: ['appetizer'] },
    { id: '8', name: 'Mango Lassi', price: 120, category: 'Beverages', isVeg: true, isPopular: true, description: 'Refreshing sweet mango-flavored yogurt drink.', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=400&h=400', cuisine: 'Beverages', pairingTags: ['beverage'] },
    { id: '9', name: 'Veg Samosa', price: 50, category: 'Appetizers', isVeg: true, isPopular: true, description: 'Crispy pastry filled with spiced potatoes and peas.', image: '/images/samosa.jpg', cuisine: 'North Indian', pairingTags: ['appetizer', 'snack'] }, // Image 5
    { id: '10', name: 'Chana Masala', price: 180, category: 'Main Course', isVeg: true, isPopular: false, description: 'Spicy chickpeas cooked in a tangy tomato-onion gravy.', image: '/images/chanamasala.png', cuisine: 'North Indian', pairingTags: ['main', 'side'] },
    { id: '11', name: 'Palak Paneer', price: 260, category: 'Main Course', isVeg: true, isPopular: true, description: 'Cottage cheese cubes in a creamy spinach sauce.', image: '/images/palak_paneer.png', cuisine: 'North Indian', pairingTags: ['main', 'side'] },
    { id: '12', name: 'Chicken Tikka Masala', price: 360, category: 'Main Course', isVeg: false, isPopular: true, description: 'Grilled chicken chunks in a spicy, creamy tomato sauce.', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400&h=400', cuisine: 'North Indian', pairingTags: ['main'] },
    { id: '13', name: 'Mixed Veg Paratha', price: 80, category: 'Breads', isVeg: true, isPopular: false, description: 'Wheat flatbread stuffed with spiced mixed vegetables.', image: '/images/paratha.png', cuisine: 'North Indian', pairingTags: ['bread'] },
    { id: '14', name: 'Rasmalai', price: 110, category: 'Desserts', isVeg: true, isPopular: true, description: 'Soft cottage cheese dumplings in sweetened saffron milk.', image: '/images/ras_malai.png', cuisine: 'North Indian', pairingTags: ['dessert'] }, // Image 3
    { id: '15', name: 'Masala Tea', price: 40, category: 'Beverages', isVeg: true, isPopular: true, description: 'Traditional Indian spiced tea with milk.', image: '/images/masalatea.png', cuisine: 'Beverages', pairingTags: ['beverage'] }, // Image 6 (fallback)
    { id: '16', name: 'Veg Hakka Noodles', price: 190, category: 'Main Course', isVeg: true, isPopular: true, description: 'Stir-fried noodles with crisp vegetables and soy sauce.', image: '/images/hakka_noodles.jpg', cuisine: 'Indo-Chinese', pairingTags: ['main'] },
    { id: '17', name: 'Gobi Manchurian', price: 210, category: 'Appetizers', isVeg: true, isPopular: true, description: 'Deep-fried cauliflower tossed in spicy Indo-Chinese sauce.', image: '/images/gobi_manchurian.jpg', cuisine: 'Indo-Chinese', pairingTags: ['appetizer', 'side'] }, // Image 7
    { id: '18', name: 'Fish Amritsari', price: 420, category: 'Appetizers', isVeg: false, isPopular: false, description: 'Spicy batter-fried fish from the heart of Amritsar.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400&h=400', cuisine: 'North Indian', pairingTags: ['appetizer'] },
    { id: '19', name: 'Jalebi', price: 100, category: 'Desserts', isVeg: true, isPopular: false, description: 'Crispy, syrup-filled swirls of joy.', image: '/images/jalebi.png', cuisine: 'North Indian', pairingTags: ['dessert'] },
    { id: '20', name: 'Laddoo', price: 120, category: 'Desserts', isVeg: true, isPopular: false, description: 'Sweet round treats made of gram flour and sugar.', image: '/images/laddoo.png', cuisine: 'North Indian', pairingTags: ['dessert'] },
    { id: '21', name: 'Masala Papad', price: 50, category: 'Appetizers', isVeg: true, isPopular: true, description: 'Crispy lentil wafer topped with spicy chop onion, tomato and coriander.', image: '/images/masalapapad.png', cuisine: 'North Indian', pairingTags: ['appetizer', 'snack'] },
];

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            // Simulate API delay
            await new Promise(r => setTimeout(r, 500));
            return CATEGORIES;
        }
    });
};

interface UseMenuItemsProps {
    category?: string;
    search?: string;
    isVegOnly?: boolean;
}

export const useMenuItems = ({ category, search, isVegOnly }: UseMenuItemsProps) => {
    return useInfiniteQuery({
        queryKey: ['menu-items', { category, search, isVegOnly }],
        queryFn: async ({ pageParam = 0 }) => {
            // Simulate API delay
            await new Promise(r => setTimeout(r, 800));

            let filtered = MOCK_ITEMS;

            if (category && category !== 'Recommended') {
                filtered = filtered.filter(item => item.category === category);
            } else if (category === 'Recommended') {
                filtered = filtered.filter(item => item.isPopular);
            }

            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(s) ||
                    item.description.toLowerCase().includes(s)
                );
            }

            if (isVegOnly) {
                filtered = filtered.filter(item => item.isVeg);
            }

            // Pagination simulation (2 items per page)
            const pageSize = 4;
            const start = pageParam * pageSize;
            const items = filtered.slice(start, start + pageSize);

            return {
                items,
                nextPage: items.length === pageSize ? pageParam + 1 : undefined
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });
};
