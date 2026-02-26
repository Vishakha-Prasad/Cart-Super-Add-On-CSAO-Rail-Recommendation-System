import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import { PersistentCart } from "@/components/cart/persistent-cart";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Zomato CSAO | Cart Super Add-On",
    description: "Next-gen recommendation rails for high-frequency updates.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <Providers>
                    {children}
                    <PersistentCart />
                </Providers>
            </body>
        </html>
    );
}
