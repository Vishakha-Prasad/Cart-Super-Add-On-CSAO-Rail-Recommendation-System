'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimationContextType {
    flyToCart: (startPos: { x: number, y: number }, image: string) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
    const [flyingItems, setFlyingItems] = useState<{ id: number, x: number, y: number, image: string }[]>([]);

    const flyToCart = useCallback((startPos: { x: number, y: number }, image: string) => {
        const id = Date.now();
        setFlyingItems(prev => [...prev, { id, ...startPos, image }]);

        // Remove item after animation completes
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== id));
        }, 800);
    }, []);

    return (
        <AnimationContext.Provider value={{ flyToCart }}>
            {children}
            <AnimatePresence>
                {flyingItems.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{ x: item.x, y: item.y, scale: 1, opacity: 1 }}
                        animate={{
                            // Approximate location of the cart icon based on standard layouts
                            x: typeof window !== 'undefined' ? window.innerWidth - 80 : 0,
                            y: typeof window !== 'undefined' ? window.innerHeight - 80 : 0,
                            scale: 0.1,
                            opacity: 0.5
                        }}
                        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                        className="fixed z-[100] w-12 h-12 pointer-events-none"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item.image}
                            alt="Flying item"
                            className="w-full h-full object-cover rounded-full shadow-2xl border-2 border-primary"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </AnimationContext.Provider>
    );
};

export const useAnimations = () => {
    const context = useContext(AnimationContext);
    if (!context) throw new Error('useAnimations must be used within an AnimationProvider');
    return context;
};
