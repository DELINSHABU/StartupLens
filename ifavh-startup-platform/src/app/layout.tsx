import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StartupLens — AI Startup Ecosystem Platform",
  description: "A platform for founders, investors, startups and developers powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased font-sans bg-[#0c1324] text-[#dce1fb] min-h-screen flex`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
