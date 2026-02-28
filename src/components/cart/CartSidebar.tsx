'use client';

import React from 'react';
import { useCartStore } from '@/features/cart/cartStore';
import { Button } from '@/components/atoms/Button';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CSAORail } from '@/components/recommendations/csao-rail';

export const CartSidebar = () => {
    const [hasMounted, setHasMounted] = React.useState(false);
    const { items, removeItem, clearCart, getSubtotal } = useCartStore();
    const total = getSubtotal();

    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;

    return (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-card shadow-xl p-4 flex flex-col border-l z-50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <ShoppingCart size={24} className="text-primary" /> My Cart
                </h2>
                <Button variant="outline" size="sm" onClick={() => { }} className="border-none hover:bg-slate-100">
                    <X size={18} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8">
                <div>
                    <AnimatePresence mode="popLayout">
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-500 text-center mt-10"
                            >
                                Your cart is empty
                            </motion.div>
                        ) : (
                            <ul className="space-y-4">
                                {items.map((item) => (
                                    <motion.li
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {item.quantity} x ₹{item.price}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </AnimatePresence>
                </div>

                <div className="pt-4 border-t">
                    <CSAORail />
                </div>
            </div>

            <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-foreground">Total</span>
                    <span className="font-bold text-lg text-primary">₹{total}</span>
                </div>

                {items.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCart}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-500 border-dashed"
                    >
                        <Trash2 size={16} /> Clear Cart
                    </Button>
                )}

                <Button className="w-full" size="lg" disabled={items.length === 0}>
                    Proceed to Checkout
                </Button>
            </div>
        </aside>
    );
};
