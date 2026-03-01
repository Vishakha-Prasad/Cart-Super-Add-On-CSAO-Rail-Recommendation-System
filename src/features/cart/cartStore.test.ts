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

    test('should increase quantity when same item is added again', () => {
        const item = { id: '1', name: 'Test', price: 100, quantity: 1 };
        useCartStore.getState().addItem(item);
        useCartStore.getState().addItem(item);
        expect(useCartStore.getState().items[0].quantity).toBe(2);
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

    // --- Quantity stepper tests ---

    test('updateQuantity: should increment item quantity by +1', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 1 });
        useCartStore.getState().updateQuantity('1', 1);
        expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    test('updateQuantity: should decrement item quantity by -1', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 3 });
        useCartStore.getState().updateQuantity('1', -1);
        expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    test('updateQuantity: should remove item when quantity drops to 0', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 1 });
        useCartStore.getState().updateQuantity('1', -1);
        expect(useCartStore.getState().items.length).toBe(0);
    });

    test('updateQuantity: should not go below 0', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 1 });
        useCartStore.getState().updateQuantity('1', -5);
        // Item should be removed (qty capped at 0 and filtered out)
        expect(useCartStore.getState().items.length).toBe(0);
    });

    test('updateQuantity: recalculates subtotal correctly after update', () => {
        useCartStore.getState().addItem({ id: '1', name: 'Test', price: 100, quantity: 2 });
        useCartStore.getState().updateQuantity('1', 1);
        expect(useCartStore.getState().getSubtotal()).toBe(300);
    });

    test('getTotalItems: returns sum of all quantities', () => {
        useCartStore.getState().addItem({ id: '1', name: 'A', price: 100, quantity: 2 });
        useCartStore.getState().addItem({ id: '2', name: 'B', price: 200, quantity: 3 });
        expect(useCartStore.getState().getTotalItems()).toBe(5);
    });
});
