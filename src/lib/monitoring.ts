'use client';

import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { tracker } from './tracker';

/**
 * Monitoring System
 * Captures Core Web Vitals and custom performance marks.
 */

const logMetric = (metric: Metric) => {
    // console.log(`[Metric] ${metric.name}: ${metric.value.toFixed(2)}`);
    tracker.track('web_vitals', {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        label: metric.delta >= 0 ? 'good' : 'poor'
    });
};

export const initMonitoring = () => {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    onCLS(logMetric);
    onINP(logMetric);
    onLCP(logMetric);
    onFCP(logMetric);
    onTTFB(logMetric);

    // Initial load mark
    performance.mark('app_init');
};

export const markPerformance = (name: string) => {
    if (typeof window === 'undefined') return;
    performance.mark(name);
    // console.log(`[Performance Mark] ${name}`);
};

export const measurePerformance = (name: string, startMark: string, endMark: string) => {
    if (typeof window === 'undefined') return;
    try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name).pop();
        if (measure) {
            tracker.track('performance_measurement', {
                name,
                duration: measure.duration,
                startTime: measure.startTime
            });
        }
    } catch (e) {
        // Mark not found
    }
};
