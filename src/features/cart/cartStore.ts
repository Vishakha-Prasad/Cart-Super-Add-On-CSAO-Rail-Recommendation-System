import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;

    // Derived state getters
    getSubtotal: () => number;
    getTotalItems: () => number;
    getTax: () => number;
    getDeliveryFee: () => number;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) =>
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === item.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                            ),
                        };
                    }
                    return { items: [...state.items, item] };
                }),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),
            updateQuantity: (id, delta) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
                    ).filter(i => i.quantity > 0)
                })),
            clearCart: () => set({ items: [] }),

            getSubtotal: () => {
                return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },
            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
            getTax: () => {
                return get().getSubtotal() * 0.05; // 5% GST
            },
            getDeliveryFee: () => {
                const subtotal = get().getSubtotal();
                return subtotal > 0 && subtotal < 500 ? 40 : 0; // Free above ₹500
            },
            getTotal: () => {
                const subtotal = get().getSubtotal();
                if (subtotal === 0) return 0;
                return subtotal + get().getTax() + get().getDeliveryFee();
            },
        }),
        {
            name: 'zomato-cart-storage',
        }
    )
);
