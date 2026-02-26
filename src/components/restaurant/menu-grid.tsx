'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCategories, useMenuItems } from '@/hooks/use-restaurant';
import { MenuItemCard } from './menu-item-card';
import { Search, Filter, Leaf, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTracking } from '@/components/providers/tracking-provider';

export const MenuGrid = () => {
    const { trackClick } = useTracking();
    const [selectedCategory, setSelectedCategory] = useState('Recommended');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isVegOnly, setIsVegOnly] = useState(false);

    // Category scroll ref for mobile
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                trackClick('search', 'menu', { query: searchQuery });
            }
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, trackClick]);

    const { data: categories, isLoading: isCategoriesLoading } = useCategories();
    const {
        data: menuData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isMenuLoading
    } = useMenuItems({
        category: selectedCategory,
        search: debouncedSearch,
        isVegOnly
    });

    const observer = useRef<IntersectionObserver>(null);
    const lastItemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isMenuLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        });

        if (lastItemRef.current) {
            observer.current.observe(lastItemRef.current);
        }
    }, [hasNextPage, isFetchingNextPage, isMenuLoading, fetchNextPage]);

    const handleCategoryChange = (category: string) => {
        trackClick('category_tab', 'menu', { category });
        setSelectedCategory(category);
    };

    const handleVegToggle = () => {
        trackClick('veg_only_toggle', 'menu', { enabled: !isVegOnly });
        setIsVegOnly(!isVegOnly);
    };

    const menuItems = menuData?.pages.flatMap(page => page.items) || [];

    return (
        <section className="max-w-7xl mx-auto px-4 py-8">
            {/* Search and Filters Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pb-4 pt-2 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleVegToggle}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all shadow-sm",
                                isVegOnly
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-white hover:bg-muted"
                            )}
                        >
                            <Leaf className={cn("w-4 h-4", isVegOnly ? "fill-green-600" : "text-gray-400")} />
                            Veg Only
                        </button>
                    </div>
                </div>

                {/* Categories Tab Bar */}
                <div className="relative group">
                    <div
                        ref={scrollContainerRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
                    >
                        {isCategoriesLoading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-full flex-shrink-0" />
                            ))
                        ) : (
                            categories?.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border",
                                        selectedCategory === category
                                            ? "bg-secondary text-white border-secondary shadow-md"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    {category}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {menuItems.map((item, index) => (
                    <div key={item.id} ref={index === menuItems.length - 1 ? lastItemRef : null}>
                        <MenuItemCard item={item} />
                    </div>
                ))}

                {/* Skeleton Loaders */}
                {(isMenuLoading || isFetchingNextPage) && (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-muted/20 rounded-2xl border border-dashed animate-pulse">
                            <div className="flex-1 space-y-3">
                                <div className="h-4 w-24 bg-muted rounded" />
                                <div className="h-6 w-3/4 bg-muted rounded" />
                                <div className="h-4 w-12 bg-muted rounded" />
                                <div className="h-10 w-full bg-muted rounded" />
                            </div>
                            <div className="w-28 h-28 bg-muted rounded-xl flex-shrink-0" />
                        </div>
                    ))
                )}
            </div>

            {/* Empty State */}
            {!isMenuLoading && menuItems.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No items found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
            )}

            {/* End of results indicator */}
            {!hasNextPage && menuItems.length > 0 && (
                <div className="text-center py-10 opacity-40">
                    <div className="h-px bg-current w-12 mx-auto mb-4" />
                    <p className="text-xs uppercase tracking-widest font-bold">End of Menu</p>
                </div>
            )}
        </section>
    );
};
