'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Variant = 'control' | 'variant_a' | 'variant_b';

interface ExperimentConfig {
    id: string;
    name: string;
    active: boolean;
    variants: Variant[];
    weights?: number[]; // [0.5, 0.5]
}

interface ExperimentContextType {
    config: ExperimentConfig[];
    assignments: Record<string, Variant>;
    getVariantFor: (experimentId: string) => Variant;
}

const EXPERIMENTS: ExperimentConfig[] = [
    {
        id: 'rail_messaging',
        name: 'CSAO Rail Title Messaging',
        active: true,
        variants: ['control', 'variant_a'],
        weights: [0.5, 0.5] // 50/50 split
    },
    {
        id: 'fallback_strategy',
        name: 'Offline Fallback Logic',
        active: false,
        variants: ['control', 'variant_a']
    }
];

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export const ExperimentProvider = ({ children, userId }: { children: React.ReactNode, userId: string }) => {
    const [assignments, setAssignments] = useState<Record<string, Variant>>({});

    // Pseudo-random but deterministic assignment based on userId
    const assignVariant = (experimentId: string, variants: Variant[], weights?: number[]): Variant => {
        let hash = 0;
        const seed = `${experimentId}:${userId}`;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }

        const normalized = Math.abs(hash) / 2147483648; // 0 to 1

        if (weights && weights.length === variants.length) {
            let cumulative = 0;
            for (let i = 0; i < weights.length; i++) {
                cumulative += weights[i];
                if (normalized <= cumulative) return variants[i];
            }
        }

        // Uniform distribution fallback
        const index = Math.floor(normalized * variants.length);
        return variants[index];
    };

    useEffect(() => {
        const newAssignments: Record<string, Variant> = {};
        EXPERIMENTS.forEach(exp => {
            if (exp.active) {
                newAssignments[exp.id] = assignVariant(exp.id, exp.variants, exp.weights);
            } else {
                newAssignments[exp.id] = 'control'; // Default if inactive
            }
        });
        setAssignments(newAssignments);

        // Optional: Persist to storage for quick subsequent loads
    }, [userId]);

    const getVariantFor = (experimentId: string): Variant => {
        return assignments[experimentId] || 'control';
    };

    return (
        <ExperimentContext.Provider value={{ config: EXPERIMENTS, assignments, getVariantFor }}>
            {children}
        </ExperimentContext.Provider>
    );
};

export const useExperiments = () => {
    const context = useContext(ExperimentContext);
    if (!context) throw new Error('useExperiments must be used within ExperimentProvider');
    return context;
};
