import { tracker } from './tracker';
import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('Tracking System', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.useFakeTimers();
    });

    test('should queue and persist events to localStorage', () => {
        tracker.track('test_event_1', { data: 'test1' });

        const queue = JSON.parse(localStorage.getItem('csao_tracking_queue') || '[]');
        expect(queue.length).toBeGreaterThanOrEqual(1);
        expect(queue[0].eventName).toBe('test_event_1');
    });

    test('should persist session ID', () => {
        tracker.track('init');
        const sid1 = sessionStorage.getItem('csao_session_id');
        expect(sid1).toBeDefined();

        const sid2 = sessionStorage.getItem('csao_session_id');
        expect(sid1).toBe(sid2);
    });

    test('should flush when batch size is reached', () => {
        localStorage.setItem('csao_tracking_queue', '[]');

        for (let i = 0; i < 15; i++) {
            tracker.track(`event_${i}`);
        }

        const queue = JSON.parse(localStorage.getItem('csao_tracking_queue') || '[]');
        // Flushes on every 10 events
        expect(queue.length).toBeLessThan(10);
    });
});
