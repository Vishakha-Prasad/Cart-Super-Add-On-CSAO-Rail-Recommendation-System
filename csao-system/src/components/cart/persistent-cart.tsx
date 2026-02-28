'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronUp, ChevronDown, Trash2, Plus, Minus, X } from 'lucide-react';
import { useCartStore } from '@/features/cart/cartStore';
import { cn } from '@/lib/utils';

const SequentialRail = dynamic(() => import('@/components/recommendations/sequential-rail').then(mod => mod.SequentialRail), {
    ssr: false,
    loading: () => <div className="h-40 w-full animate-pulse bg-muted/50 rounded-xl" />
});

export const PersistentCart = () => {
    const { items, updateQuantity, clearCart, getSubtotal, getTotalItems, getTotal } = useCartStore();

    // Get the first item added to the cart
    const firstItemId = items.length > 0 ? items[0].id : null;
    const [isExpanded, setIsExpanded] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const totalItems = getTotalItems();

    if (!mounted || totalItems === 0) return null;

    const subtotal = getSubtotal();
    const total = getTotal();

    return (
        <>
            {/* Desktop Sidebar / Mobile Bottom Bar */}
            <div className={cn(
                "fixed z-50 transition-all duration-300 ease-in-out",
                "bottom-0 left-0 right-0 h-16 bg-primary text-white flex items-center justify-between px-6 shadow-lg lg:top-0 lg:right-0 lg:left-auto lg:h-full lg:w-80 lg:flex-col lg:items-stretch lg:pt-20 lg:px-4 lg:bg-background lg:text-foreground lg:border-l",
                isExpanded && "h-auto max-h-[80vh] flex-col items-stretch pt-4 rounded-t-3xl lg:h-full lg:max-h-full lg:rounded-none"
            )}>

                {/* Mobile/Small Screen Header (Sticky when collapsed) */}
                <div
                    className="flex items-center justify-between w-full lg:hidden cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {totalItems}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold">₹{subtotal.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] opacity-80">{totalItems} Item{totalItems > 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    <button className="flex items-center gap-1 text-sm font-bold bg-white/20 px-3 py-1.5 rounded-lg">
                        VIEW CART {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> My Cart
                    </h2>
                    <button
                        onClick={() => setShowConfirmClear(true)}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> Clear Cart
                    </button>
                </div>

                {/* Cart Content (Items list) */}
                <AnimatePresence>
                    {(isExpanded || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="flex-1 overflow-y-auto py-4 space-y-4 px-2 custom-scrollbar"
                        >
                            {items.map((item: any) => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-[10px] text-muted-foreground">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">₹{item.price}</p>
                                    </div>
                                    <div className="flex items-center bg-muted rounded-md border">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 hover:bg-black/5 rounded-l-md"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 hover:bg-black/5 rounded-r-md"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sequential Recommendation Rail */}
                {(isExpanded || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                    <div className="border-t pt-2">
                        <SequentialRail firstItemId={firstItemId} />
                    </div>
                )}

                {/* Footer / Summary */}
                <div className={cn(
                    "lg:mt-auto lg:border-t lg:pt-6 lg:pb-8",
                    !isExpanded && "hidden lg:block"
                )}>
                    <div className="space-y-2 mb-6 hidden lg:block">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivery Fee</span>
                            <span className={subtotal >= 500 ? "text-green-600 font-medium" : ""}>
                                {subtotal >= 500 ? "FREE" : "₹40"}
                            </span>
                        </div>
                    </div>

                    <div className="flex lg:flex-col gap-3">
                        {isExpanded && (
                            <button
                                onClick={() => setShowConfirmClear(true)}
                                className="lg:hidden flex-1 py-3 text-sm font-medium text-destructive border border-destructive/20 rounded-xl"
                            >
                                Clear Cart
                            </button>
                        )}
                        <button className="flex-1 bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                            Proceed to Checkout
                            <span className="lg:ml-auto">₹{total.toLocaleString('en-IN')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Clear Cart Confirmation Modal */}
            <AnimatePresence>
                {showConfirmClear && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background max-w-sm w-full p-8 rounded-3xl shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Clear your cart?</h3>
                            <p className="text-muted-foreground mb-8">
                                Are you sure you want to remove all items from your cart? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmClear(false)}
                                    className="flex-1 py-3 font-semibold text-muted-foreground bg-muted rounded-xl hover:bg-muted/80"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        clearCart();
                                        setShowConfirmClear(false);
                                        setIsExpanded(false);
                                    }}
                                    className="flex-1 py-3 font-semibold text-white bg-destructive rounded-xl shadow-lg shadow-destructive/20 hover:bg-destructive/90"
                                >
                                    Yes, Clear
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
