'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Star } from 'lucide-react';
import { useCartStore } from '@/features/cart/cartStore';
import { cn } from '@/lib/utils';
import { useTracking } from '@/components/providers/tracking-provider';
import { useAnimations } from '@/components/providers/animation-provider';

interface MenuItemCardProps {
    item: {
        id: string;
        name: string;
        price: number;
        description: string;
        image: string;
        isVeg: boolean;
        isPopular?: boolean;
    };
}

/**
 * MenuItemCard component for the restaurant menu.
 * Synchronizes with CartStore and provides Fly-to-Cart interaction.
 */
export const MenuItemCard = ({ item }: MenuItemCardProps) => {
    const { items, addItem, updateQuantity } = useCartStore();
    const { trackCartEvent, trackClick } = useTracking();
    const { flyToCart } = useAnimations();

    const cartItem = items.find(i => i.id === item.id);
    const quantity = cartItem?.quantity || 0;

    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        trackCartEvent('add', { id: item.id, name: item.name, price: item.price });

        // Micro-interaction: Fly to cart
        flyToCart({ x: e.clientX, y: e.clientY }, item.image);

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }

        addItem({ ...item, quantity: 1 });
    };

    const handleUpdate = (id: string, delta: number) => {
        trackCartEvent(delta > 0 ? 'update' : 'remove', { id, delta });
        updateQuantity(id, delta);
    };

    const toggleExpand = () => {
        trackClick('expand_description', 'menu_item', { id: item.id, state: !isExpanded });
        setIsExpanded(!isExpanded);
    };

    return (
        <motion.div
            layout
            data-track-id={item.id}
            data-track-category="menu_item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 p-4 bg-white dark:bg-card rounded-2xl border hover:shadow-md transition-shadow group relative"
        >
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "w-4 h-4 border-2 flex items-center justify-center rounded-sm flex-shrink-0",
                        item.isVeg ? "border-green-600" : "border-red-600"
                    )}>
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            item.isVeg ? "bg-green-600" : "bg-red-600"
                        )} />
                    </span>
                    {item.isPopular && (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" /> BESTSELLER
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                </h3>

                <p className="text-foreground font-semibold">₹{item.price}</p>

                <div className="relative">
                    <p className={cn(
                        "text-xs text-muted-foreground leading-relaxed",
                        !isExpanded && "line-clamp-2"
                    )}>
                        {item.description}
                    </p>
                    {item.description.length > 60 && (
                        <button
                            onClick={toggleExpand}
                            className="text-[10px] font-bold text-gray-500 mt-1 hover:text-black"
                        >
                            {isExpanded ? 'READ LESS' : 'READ MORE'}
                        </button>
                    )}
                </div>
            </div>

            <div className="relative w-28 h-28 flex-shrink-0">
                <Image
                    src={item.image}
                    alt={item.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover rounded-xl shadow-sm border"
                    sizes="112px"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                />

                {/* Add/Quantity Button */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24">
                    <AnimatePresence mode="wait">
                        {quantity === 0 ? (
                            <motion.button
                                key="add-btn"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleAdd}
                                className="w-full bg-white dark:bg-card text-primary border border-primary/20 shadow-lg py-2 rounded-lg font-bold text-sm uppercase hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                                Add
                            </motion.button>
                        ) : (
                            <motion.div
                                key="qty-selector"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="w-full bg-primary text-white shadow-lg py-2 rounded-lg font-bold text-sm flex items-center justify-between px-2"
                            >
                                <button onClick={() => handleUpdate(item.id, -1)} className="hover:bg-black/10 rounded p-0.5">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="tabular-nums">{quantity}</span>
                                <button onClick={() => handleUpdate(item.id, 1)} className="hover:bg-black/10 rounded p-0.5">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
