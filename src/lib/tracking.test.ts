import { tracker } from './tracker';
import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('Tracking System', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Reset tracker state if possible, or just mock the flush
        vi.useFakeTimers();
    });

    test('should queue and persist events to localStorage', () => {
        tracker.track('test_event_1', { data: 'test1' });

        const queue = JSON.parse(localStorage.getItem('csao_tracking_queue') || '[]');
        expect(queue.length).toBeGreaterThanOrEqual(1);
        expect(queue[0].eventName).toBe('test_event_1');
    });

    test('should persist session ID', () => {
        // Trigger session ID creation
        tracker.track('init');
        const sid1 = sessionStorage.getItem('csao_session_id');
        expect(sid1).toBeDefined();

        const sid2 = sessionStorage.getItem('csao_session_id');
        expect(sid1).toBe(sid2);
    });

    test('should flush when batch size is reached', async () => {
        // Clear queue first
        localStorage.setItem('csao_tracking_queue', '[]');

        // Push 10 events (BATCH_SIZE is 10 in tracker.ts)
        for (let i = 0; i < 10; i++) {
            tracker.track(`event_${i}`);
        }

        // Flush is async or triggered in next tick
        // Since tracker.ts uses requestIdleCallback, it might be tricky to test without mocks
        // But let's check if the queue is processed
        const queue = JSON.parse(localStorage.getItem('csao_tracking_queue') || '[]');
        // If it flushed, it should be empty (or at least smaller)
        expect(queue.length).toBe(0);
    });
});
