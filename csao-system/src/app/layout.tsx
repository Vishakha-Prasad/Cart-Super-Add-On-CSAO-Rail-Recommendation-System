import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Providers from '@/lib/providers';
import { CartSidebar } from '@/components/cart/CartSidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Zomato CSAO Demo',
    description: 'Cart Super Add-On System Phase Migration',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    {children}
                    <CartSidebar />
                </Providers>
            </body>
        </html>
    );
}
