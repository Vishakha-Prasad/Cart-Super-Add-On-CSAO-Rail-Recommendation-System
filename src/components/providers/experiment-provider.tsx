'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { getVariant, getAllExperiments } from '@/lib/ab-testing';

interface ExperimentContextType {
    variants: Record<string, string>;
    getVariantFor: (id: string) => string;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export const ExperimentProvider = ({
    children,
    userId
}: {
    children: React.ReactNode;
    userId: string;
}) => {
    const variants = useMemo(() => {
        const experimentIds = getAllExperiments();
        const assignments: Record<string, string> = {};
        experimentIds.forEach(id => {
            assignments[id] = getVariant(id, userId);
        });
        return assignments;
    }, [userId]);

    const getVariantFor = (id: string) => variants[id] || 'control';

    return (
        <ExperimentContext.Provider value={{ variants, getVariantFor }}>
            {children}
        </ExperimentContext.Provider>
    );
};

export const useExperiments = () => {
    const context = useContext(ExperimentContext);
    if (!context) {
        throw new Error('useExperiments must be used within an ExperimentProvider');
    }
    return context;
};
