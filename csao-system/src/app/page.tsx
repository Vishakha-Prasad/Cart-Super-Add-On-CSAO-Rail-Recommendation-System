'use client';

import { MenuGrid } from "@/components/restaurant/menu-grid";
import { ShoppingBag } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen bg-background pb-20 lg:pb-0 pr-80 transition-colors duration-300">
            {/* Navigation Header */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 h-14 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary flex items-center gap-2 tracking-tight">
                        <ShoppingBag className="w-5 h-5" /> CSAO Store
                    </h1>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-64 w-full overflow-hidden">
                <img
                    src="/images/hero.png"
                    alt="Premium Indian Food"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">The Grand Indian Kitchen</h2>
                        <div className="flex items-center gap-3 text-white/90 text-sm font-medium">
                            <span>North Indian • Chinese • Desserts</span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span>₹400 for two</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <MenuGrid />
            </div>
        </main>
    );
}
