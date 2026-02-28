'use client';

import { RecommendationResponseSchema, type RecommendationResponse } from '@/lib/schemas';

const CACHE_KEY_PREFIX = 'csao_recommendations_cache_';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

interface CacheEntry {
    data: RecommendationResponse;
    timestamp: number;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<RecommendationResponse>>();

/**
 * Helper to get current time slot for caching
 */
const getTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 19) return 'snacks';
    return 'dinner';
};

/**
 * Request Signing (HMAC-like simulation for production readiness)
 */
const signRequest = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode('csao_secret_key_2026'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
};

/**
 * Mock Server-Side Cache (Redis-like)
 */
const mockRedisCache = new Map<string, { data: any, expires: number }>();

const getRedisCache = (key: string) => {
    const entry = mockRedisCache.get(key);
    if (entry && entry.expires > Date.now()) return entry.data;
    return null;
};

const setRedisCache = (key: string, data: any, ttlDays = 1) => {
    mockRedisCache.set(key, { data, expires: Date.now() + ttlDays * 24 * 60 * 60 * 1000 });
};

/**
 * Fetch recommendations from the simulated API
 */
export const fetchRecommendations = async (
    cartItemIds: string[],
    restaurantId: string = 'rest_1'
): Promise<RecommendationResponse> => {
    const sortedIds = [...cartItemIds].sort().join(',');
    const timeSlot = getTimeSlot();
    const cacheKey = `${CACHE_KEY_PREFIX}${restaurantId}_${timeSlot}_${sortedIds}`;
    const redisKey = `global_${restaurantId}_${timeSlot}_popular`;

    // 1. Check local cache
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp }: CacheEntry = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
        }
    }

    // 2. Check "Server-side" Redis Cache
    const serverCached = getRedisCache(redisKey);
    if (serverCached && cartItemIds.length === 0) {
        return serverCached;
    }

    // 3. Request Deduplication
    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey)!;
    }

    const request = (async () => {
        try {
            // Security: Sign the request
            await signRequest(`${restaurantId}:${sortedIds}`);

            const rawResult = await fetchWithRetry(() => simulateApiCall(cartItemIds));

            // Validation
            const validatedResult = RecommendationResponseSchema.parse(rawResult);

            if (cartItemIds.length === 0) {
                setRedisCache(redisKey, validatedResult);
            }
            return validatedResult;
        } catch (err) {
            if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
                console.error('API Validation Failed:', err);
                throw new Error('Received malformed data from recommendations service');
            }
            throw err;
        } finally {
            pendingRequests.delete(cacheKey);
        }
    })();

    pendingRequests.set(cacheKey, request);
    const result = await request;

    // 4. Update Local Cache
    if (typeof window !== 'undefined') {
        const entry: CacheEntry = { data: result, timestamp: Date.now() };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
    }

    return result;
};

/**
 * Simulated API call with potential failure
 */
const simulateApiCall = async (cartItemIds: string[]): Promise<any> => {
    await new Promise(r => setTimeout(r, 800));

    if (Math.random() < 0.1) {
        throw new Error('Recommendation API Unreachable');
    }

    const hasDessert = cartItemIds.some(id => id.includes('dessert') || id === '5' || id === '14' || id === '19' || id === '20');
    const hasHakkaNoodles = cartItemIds.includes('16');

    const recommendations = [
        { id: 'rec_10', name: 'Thums Up (250ml)', price: 40, rating: 4.5, category: 'Beverages', description: 'Strong cola', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200' },
        { id: 'rec_12', name: 'Fresh Lime Soda', price: 90, rating: 4.3, category: 'Beverages', description: 'Sweet or Salted', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200' }
    ];

    // Priority recommendation for Hakka Noodles
    if (hasHakkaNoodles) {
        recommendations.unshift({
            id: '17',
            name: 'Gobi Manchurian',
            price: 210,
            rating: 4.7,
            category: 'Appetizers',
            description: 'The perfect pair for noodles!',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200'
        });
    } else {
        recommendations.push({ id: 'rec_11', name: 'Masala Papad', price: 30, rating: 4.6, category: 'Sides', description: 'Crispy and spicy', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4709a?w=200' });
    }

    return {
        title: hasHakkaNoodles ? "The Perfect Pair!" : hasDessert ? "Perfect pairings for your sweet tooth" : "People also ordered",
        recommendations: recommendations.slice(0, 3)
    };
};

/**
 * Simple retry logic with exponential backoff
 */
const fetchWithRetry = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetry(fn, retries - 1, delay * 2);
    }
};
