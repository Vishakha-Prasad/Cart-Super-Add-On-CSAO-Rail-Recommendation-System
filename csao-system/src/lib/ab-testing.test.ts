import { getVariant } from '../lib/ab-testing';
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
        expect(typeof v1).toBe('string');
        expect(typeof v2).toBe('string');
    });

    test('should handle unknown experiments with control', () => {
        expect(getVariant('non_existent', 'user_1')).toBe('control');
    });
});
