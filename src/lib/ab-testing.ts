'use client';

/**
 * A/B Testing Engine
 * Provides deterministic variant assignment based on user IDs.
 */

type Variant = 'control' | 'variant_a' | 'variant_b';

interface ExperimentConfig {
    id: string;
    variants: Variant[];
    weights?: number[]; // Percentage weights for each variant
}

const EXPERIMENTS: Record<string, ExperimentConfig> = {
    'rail_messaging': {
        id: 'rail_messaging',
        variants: ['control', 'variant_a'], // control: "Complete your meal", A: "Add-ons for you"
    },
    'rail_position': {
        id: 'rail_position',
        variants: ['control', 'variant_a'], // control: bottom (default), A: top of menu
    },
    'card_design': {
        id: 'card_design',
        variants: ['control', 'variant_a'], // control: detailed, A: compact
    }
};

/**
 * Simple deterministic hash function for strings
 */
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

/**
 * Assigns a variant to a user based on their ID
 */
export const getVariant = (experimentId: string, userId: string): Variant => {
    // 1. Check for URL Overrides (for testing/QA)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const override = params.get(`ab_${experimentId}`);
        if (override === 'control' || override === 'variant_a' || override === 'variant_b') {
            return override;
        }
    }

    const config = EXPERIMENTS[experimentId];
    if (!config) return 'control';

    // 2. Deterministic assignment
    const hash = hashString(`${userId}:${experimentId}`);
    const index = hash % config.variants.length;

    return config.variants[index];
};

export const getAllExperiments = () => Object.keys(EXPERIMENTS);
