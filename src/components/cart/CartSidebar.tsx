'use client';

import React from 'react';
import { useCartStore } from '@/features/cart/cartStore';
import { Button } from '@/components/atoms/Button';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CSAORail } from '@/components/recommendations/csao-rail';

export const CartSidebar = () => {
    const [hasMounted, setHasMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(true);
    const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTotalItems } = useCartStore();
    const subtotal = getSubtotal();
    const totalItems = getTotalItems();

    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;

    return (
        <>
            {/* Floating re-open button — shown when sidebar is closed */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="reopen-btn"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Open cart"
                    >
                        <ShoppingCart size={22} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-primary">
                                {totalItems}
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        key="cart-sidebar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-card shadow-xl p-4 flex flex-col border-l z-50"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <ShoppingCart size={24} className="text-primary" /> My Cart
                                {totalItems > 0 && (
                                    <span className="text-sm font-normal text-slate-400">({totalItems})</span>
                                )}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                aria-label="Close cart"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Items list */}
                        <div className="flex-1 overflow-y-auto space-y-6">
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
                                        <ul className="space-y-3">
                                            {items.map((item) => (
                                                <motion.li
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                                                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                                                >
                                                    {/* Item info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>

                                                    {/* Quantity stepper */}
                                                    <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="px-2 py-1.5 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                            aria-label={`Decrease quantity of ${item.name}`}
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-6 text-center text-xs font-bold text-foreground">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="px-2 py-1.5 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                            aria-label={`Increase quantity of ${item.name}`}
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>

                                                    {/* Remove button */}
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                                                        aria-label={`Remove ${item.name}`}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* CSAO Rail */}
                            <div className="pt-4 border-t">
                                <CSAORail />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-4 space-y-3 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-foreground">Subtotal</span>
                                <span className="font-bold text-lg text-primary">
                                    ₹{subtotal.toLocaleString('en-IN')}
                                </span>
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
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};
