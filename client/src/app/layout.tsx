'use client';

import { useState } from "react";
import { Geist } from "next/font/google";
import AdminPortal from "@/components/AdminPortal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} antialiased`}>
        {/* Admin Portal Trigger */}
        <a
          href="https://acm.upr.edu/about/"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-4 right-4 text-slate-600 hover:text-slate-500 transition-colors z-50 text-sm"
        >
          acm usar
        </a>
        <div
          onClick={() => setIsPortalOpen(true)}
          className="fixed top-4 right-20 text-slate-600 hover:text-slate-500 transition-colors cursor-pointer z-50 text-sm"
        >
          admin
        </div>

        {/* Admin Portal */}
        {isPortalOpen && (
          <AdminPortal onClose={() => setIsPortalOpen(false)} />
        )}

        {children}
      </body>
    </html>
  );
}
