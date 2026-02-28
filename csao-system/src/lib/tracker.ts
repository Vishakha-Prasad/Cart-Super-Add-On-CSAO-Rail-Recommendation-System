'use client';

/**
 * Core Tracking Infrastructure
 * Handles event queueing, batching, and offline persistence.
 */

type TrackingEvent = {
    eventName: string;
    properties: Record<string, any>;
    timestamp: number;
    sessionId: string;
};

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'csao_tracking_queue';
const SESSION_KEY = 'csao_session_id';

class Tracker {
    private queue: TrackingEvent[] = [];
    private sessionId: string;
    private flushTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.hydrateQueue();
        this.setupFlushInterval();
        this.setupUnloadHandler();
    }

    private getOrCreateSessionId(): string {
        if (typeof window === 'undefined') return '';
        let sid = sessionStorage.getItem(SESSION_KEY);
        if (!sid) {
            sid = `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
            sessionStorage.setItem(SESSION_KEY, sid);
        }
        return sid;
    }

    private hydrateQueue() {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                this.queue = JSON.parse(stored);
            } catch (e) {
                this.queue = [];
            }
        }
    }

    private persistQueue() {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    }

    private setupFlushInterval() {
        if (typeof window === 'undefined') return;
        this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL);
    }

    private setupUnloadHandler() {
        if (typeof window === 'undefined') return;
        window.addEventListener('beforeunload', () => this.flush(true));
    }

    public track(eventName: string, properties: Record<string, any> = {}) {
        const event: TrackingEvent = {
            eventName,
            properties,
            timestamp: Date.now(),
            sessionId: this.sessionId,
        };

        // Use requestIdleCallback if available for performance
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
                this.queue.push(event);
                this.persistQueue();
                if (this.queue.length >= BATCH_SIZE) this.flush();
            });
        } else {
            this.queue.push(event);
            this.persistQueue();
            if (this.queue.length >= BATCH_SIZE) this.flush();
        }
    }

    public async flush(isUnload = false) {
        if (this.queue.length === 0) return;

        const eventsToSend = [...this.queue];
        this.queue = [];
        this.persistQueue();

        // console.log(`[Tracker] Flushing ${eventsToSend.length} events...`, eventsToSend);

        if (isUnload && typeof navigator !== 'undefined' && navigator.sendBeacon) {
            // Use sendBeacon for reliable delivery on unload
            const blob = new Blob([JSON.stringify(eventsToSend)], { type: 'application/json' });
            navigator.sendBeacon('/api/track', blob);
            return;
        }

        try {
            // In a real app, this would be a POST request
            // const response = await fetch('/api/track', {
            //     method: 'POST',
            //     body: JSON.stringify(eventsToSend),
            // });
            // if (!response.ok) throw new Error('Flush failed');

            // Simulating successful flush
            await new Promise(r => setTimeout(r, 100));
        } catch (e) {
            // console.error('[Tracker] Flush failed, re-queueing events', e);
            this.queue = [...eventsToSend, ...this.queue];
            this.persistQueue();
        }
    }
}

export const tracker = new Tracker();
