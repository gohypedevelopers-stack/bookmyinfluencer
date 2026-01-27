import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookmyinfluencer - Connect Brands with Creators",
  description: "The most trusted platform connecting brands with verified influencers. Secure escrow payments, verified metrics, and streamlined creator partnerships.",
  keywords: ["influencer marketing", "creator marketplace", "brand partnerships", "influencer hiring"],
  authors: [{ name: "Bookmyinfluencer" }],
  openGraph: {
    title: "Bookmyinfluencer - Connect Brands with Creators",
    description: "The most trusted platform for influencer marketing and creator partnerships",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2b5d8f" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen w-full overflow-x-hidden antialiased bg-background text-foreground`}
      >
        <div className="flex w-full flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
