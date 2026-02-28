'use client';

import React from 'react';
import { useCartStore } from '@/features/cart/cartStore';
import { Button } from '@/components/atoms/Button';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SequentialRail } from '@/components/recommendations/sequential-rail';
import { cn } from '@/lib/utils';

export const CartSidebar = () => {
    const [hasMounted, setHasMounted] = React.useState(false);
    const { items, removeItem, clearCart, getSubtotal } = useCartStore();
    const total = getSubtotal();
    const firstItemId = items.length > 0 ? items[0].id : null;

    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;

    return (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 flex flex-col border-l border-[#DFE1E6] z-50 transition-all duration-300">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-3 text-[#172B4D]">
                    <ShoppingCart size={22} className="text-[#0052CC]" /> My Cart
                </h2>
                <button
                    onClick={() => { }}
                    className="p-1.5 rounded hover:bg-[#EBECF0] text-[#42526E] transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 no-scrollbar">
                <div>
                    <AnimatePresence mode="popLayout" initial={false}>
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[#6B778C] text-center mt-12 px-4"
                            >
                                <div className="mb-4 text-4xl opacity-20 flex justify-center">🛒</div>
                                <p className="text-sm font-medium">Your cart is empty</p>
                                <p className="text-xs mt-1">Add some items from the menu to get started!</p>
                            </motion.div>
                        ) : (
                            <ul className="space-y-4">
                                {items.map((item) => (
                                    <motion.li
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex justify-between items-start p-3 bg-white rounded border border-transparent hover:border-[#DFE1E6] hover:bg-[#F4F5F7] transition-all group"
                                    >
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="font-semibold text-sm text-[#172B4D] truncate">{item.name}</p>
                                            <p className="text-xs text-[#6B778C] mt-0.5">
                                                {item.quantity} x ₹{item.price}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-sm font-bold text-[#172B4D]">₹{item.quantity * item.price}</p>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-[#6B778C] hover:text-[#FF5630] transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </AnimatePresence>
                </div>

                <div className="pt-6 border-t border-[#DFE1E6]">
                    <SequentialRail firstItemId={firstItemId} />
                </div>
            </div>

            <div className="border-t border-[#DFE1E6] pt-6 space-y-5">
                <div className="flex justify-between items-center px-1">
                    <span className="font-semibold text-[#6B778C]">Subtotal</span>
                    <span className="font-bold text-xl text-[#172B4D]">₹{total}</span>
                </div>

                <div className="flex flex-col gap-3">
                    {items.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#6B778C] hover:text-[#FF5630] transition-colors py-1"
                        >
                            <Trash2 size={14} /> Clear Cart
                        </button>
                    )}

                    <button
                        className={cn(
                            "w-full py-3 rounded font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2",
                            items.length === 0
                                ? "bg-[#EBECF0] text-[#A5ADBA] cursor-not-allowed"
                                : "bg-[#0052CC] text-white hover:bg-[#0065FF] active:scale-[0.98]"
                        )}
                        disabled={items.length === 0}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </aside>
    );
};
