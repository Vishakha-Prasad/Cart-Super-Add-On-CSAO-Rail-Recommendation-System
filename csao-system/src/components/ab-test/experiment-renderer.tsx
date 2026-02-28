'use client';

import React, { useEffect, useRef } from 'react';
import { useExperiments } from '@/components/providers/experiment-provider';
import { tracker } from '@/lib/tracker';

interface ExperimentRendererProps {
    id: string;
    control: React.ReactNode;
    variantA?: React.ReactNode;
    variantB?: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ExperimentRenderer = ({
    id,
    control,
    variantA,
    variantB,
    fallback
}: ExperimentRendererProps) => {
    const { getVariantFor } = useExperiments();
    const variant = getVariantFor(id);
    const hasTracked = useRef(false);

    // Exposure Tracking
    useEffect(() => {
        if (!hasTracked.current) {
            tracker.track('experiment_exposure', {
                experimentId: id,
                variant
            });
            hasTracked.current = true;
        }
    }, [id, variant]);

    if (variant === 'control') return <>{control}</>;
    if (variant === 'variant_a' && variantA) return <>{variantA}</>;
    if (variant === 'variant_b' && variantB) return <>{variantB}</>;

    return <>{fallback || control}</>;
};
