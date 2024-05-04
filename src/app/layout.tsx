import type { Metadata } from "next";
import { Inter, JetBrains_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" });

export const metadata: Metadata = {
  title: "SpendLens — AI Spend Audit Tool",
  description: "Find Out Where Your AI Budget Is Going.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} ${dmSerif.variable} font-sans bg-[#0A0A0F] text-white min-h-screen`}>
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
