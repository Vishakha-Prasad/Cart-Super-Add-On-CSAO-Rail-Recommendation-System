// This is a mock test file to verify the logic of the Zustand store.
// In a real environment, you would run this with Jest or Vitest.

import { useCartStore } from './cartStore';

describe('Cart Store Logic', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
    });

    test('should add an item correctly', () => {
        const item = { id: '1', name: 'Test', price: 100, quantity: 1 };
        useCartStore.getState().addItem(item);
        expect(useCartStore.getState().items.length).toBe(1);
    });

    test('should calculate subtotal correctly', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 2 });
        expect(useCartStore.getState().getSubtotal()).toBe(200);
    });

    test('should calculate tax (5%) correctly', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 1 });
        expect(useCartStore.getState().getTax()).toBe(5);
    });

    test('should apply delivery fee below ₹500', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 1 });
        expect(useCartStore.getState().getDeliveryFee()).toBe(40);
    });

    test('should give free delivery above ₹500', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 600, quantity: 1 });
        expect(useCartStore.getState().getDeliveryFee()).toBe(0);
    });

    test('should clear cart correctly', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 1 });
        useCartStore.getState().clearCart();
        expect(useCartStore.getState().items.length).toBe(0);
    });
});
