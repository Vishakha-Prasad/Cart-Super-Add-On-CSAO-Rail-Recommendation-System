'use client';

import { MenuGrid } from "@/components/restaurant/menu-grid";
import { ShoppingBag } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-50 pb-20 lg:pb-0 pr-80">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" /> CSAO Store
                    </h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col gap-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">The Grand Indian Kitchen</h2>
                        <p className="text-slate-500 italic">North Indian, Chinese, Desserts • ₹400 for two</p>
                    </div>

                    <MenuGrid />
                </div>
            </div>
        </main>
    );
}
