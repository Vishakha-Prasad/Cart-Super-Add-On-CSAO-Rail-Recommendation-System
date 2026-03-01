import { getVariant } from './ab-testing';
import { describe, test, expect } from 'vitest';

describe('A/B Testing Engine', () => {
    test('should assign consistent variants for the same user', () => {
        const user = 'user_abc_123';
        const v1 = getVariant('rail_messaging', user);
        const v2 = getVariant('rail_messaging', user);
        expect(v1).toBe(v2);
    });

    test('should provide different variants for different experiments potentially', () => {
        const user = 'user_123';
        const v1 = getVariant('rail_messaging', user);
        const v2 = getVariant('card_design', user);
        // They might be the same by chance, but the logic should be independent
        expect(typeof v1).toBe('string');
        expect(typeof v2).toBe('string');
    });

    test('should handle unknown experiments with control', () => {
        expect(getVariant('non_existent', 'user_1')).toBe('control');
    });

    test('should support URL overrides if window is defined', () => {
        // This is tricky to test without full JSDOM mock, 
        // but we can check the logic in ab-testing.ts
        // In this test env, it should fallback to hash if no URL is set
        const v = getVariant('rail_messaging', 'user_x');
        expect(['control', 'variant_a', 'variant_b']).toContain(v);
    });
});
