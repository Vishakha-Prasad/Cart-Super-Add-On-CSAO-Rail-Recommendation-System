'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AnimationProvider } from '@/components/providers/animation-provider';
import { ExperimentProvider } from '@/components/providers/experiment-provider';
import { TrackingProvider } from '@/components/providers/tracking-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            })
    );

    const [userId, setUserId] = useState('server_user');

    useEffect(() => {
        let id = localStorage.getItem('csao_user_id');
        if (!id) {
            id = `user_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('csao_user_id', id);
        }
        setUserId(id);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <AnimationProvider>
                <ExperimentProvider userId={userId}>
                    <TrackingProvider>
                        {children}
                    </TrackingProvider>
                </ExperimentProvider>
            </AnimationProvider>
        </QueryClientProvider>
    );
}
