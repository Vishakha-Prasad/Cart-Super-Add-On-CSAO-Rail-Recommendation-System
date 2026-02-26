'use client';

import { MenuGrid } from "@/components/restaurant/menu-grid";
import { ShoppingBag } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen bg-background lg:pr-80 pb-20 lg:pb-0">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full bg-secondary overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200"
                    alt="Fine Dining"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                        ZOMATO <span className="text-primary italic">CSAO</span>
                    </h1>
                    <p className="text-xl max-w-lg font-medium opacity-90">
                        Experience the next generation of food delivery with real-time smart recommendations.
                    </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Restaurant Info (Quick Glance) */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                <div className="bg-white rounded-3xl p-8 shadow-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded">OPEN NOW</span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" /> Delivery in 25-30 mins
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">The Grand Indian Kitchen</h2>
                        <p className="text-muted-foreground">North Indian, Chinese, Desserts • ₹400 for two</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-green-700 text-white px-4 py-2 rounded-xl text-center">
                            <p className="text-xs font-bold opacity-80 uppercase">Rating</p>
                            <p className="text-xl font-black">4.2 ★</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <MenuGrid />

            {/* Spacer for mobile cart */}
            <div className="h-20 lg:hidden" />
        </main>
    );
}
