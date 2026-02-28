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
            className="flex gap-6 p-6 bg-white rounded border border-border hover:shadow-subtle transition-all group relative"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                        "w-3 h-3 border flex items-center justify-center rounded-sm flex-shrink-0",
                        item.isVeg ? "border-green-600" : "border-red-600"
                    )}>
                        <span className={cn(
                            "w-1 h-1 rounded-full",
                            item.isVeg ? "bg-green-600" : "bg-red-600"
                        )} />
                    </span>
                    {item.isPopular && (
                        <span className="bg-[#FFFAE6] text-[#FF8B00] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Bestseller
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-[#172B4D] mb-1 group-hover:text-primary transition-colors">
                    {item.name}
                </h3>

                <p className="text-[#172B4D] font-medium mb-3">₹{item.price}</p>

                <div className="relative">
                    <p className={cn(
                        "text-sm text-[#6B778C] leading-relaxed font-normal",
                        !isExpanded && "line-clamp-2"
                    )}>
                        {item.description}
                    </p>
                    {item.description.length > 60 && (
                        <button
                            onClick={toggleExpand}
                            className="text-xs font-semibold text-[#0052CC] mt-2 hover:underline"
                        >
                            {isExpanded ? 'Show less' : 'View more'}
                        </button>
                    )}
                </div>
            </div>

            <div className="relative w-32 h-32 flex-shrink-0 group-hover:scale-[1.02] transition-transform">
                <Image
                    src={item.image}
                    alt={item.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded shadow-sm border border-border"
                    sizes="128px"
                />

                {/* Add/Quantity Button */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[100px]">
                    <AnimatePresence mode="wait">
                        {quantity === 0 ? (
                            <motion.button
                                key="add-btn"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                onClick={handleAdd}
                                className="w-full bg-white text-primary border border-primary font-semibold py-1.5 rounded shadow-sm hover:bg-[#DEEBFF] transition-colors text-sm"
                            >
                                Add
                            </motion.button>
                        ) : (
                            <motion.div
                                key="qty-selector"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full bg-primary text-white shadow-md py-1.5 rounded flex items-center justify-between px-2"
                            >
                                <button onClick={() => handleUpdate(item.id, -1)} className="hover:bg-white/20 rounded p-1 transition-colors">
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm font-bold tabular-nums">{quantity}</span>
                                <button onClick={() => handleUpdate(item.id, 1)} className="hover:bg-white/20 rounded p-1 transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
