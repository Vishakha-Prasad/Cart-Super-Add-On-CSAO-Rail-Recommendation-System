import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/atoms/Button';
import { ShoppingCart, X } from 'lucide-react';

export const CartSidebar = () => {
    const { items, removeItem, clearCart } = useCartStore();
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart size={24} /> My Cart
                </h2>
                <Button variant="outline" size="sm" onClick={() => { }}> <X size={18} /> </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <p className="text-slate-500 text-center mt-10">Your cart is empty</p>
                ) : (
                    <ul className="space-y-4">
                        {items.map((item) => (
                            <li key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {item.quantity} x ₹{item.price}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg">₹{total}</span>
                </div>
                <Button className="w-full" size="lg" disabled={items.length === 0}>
                    Proceed to Checkout
                </Button>
            </div>
        </aside>
    );
};
