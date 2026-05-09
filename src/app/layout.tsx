import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: "--font-playfair" 
});

const dmMono = DM_Mono({ 
  subsets: ["latin"], 
  weight: ["400", "500"], 
  variable: "--font-dm-mono" 
});

const instrumentSans = Instrument_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600"], 
  variable: "--font-instrument-sans" 
});

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
    <html lang="en">
      <body className={`${playfair.variable} ${dmMono.variable} ${instrumentSans.variable} font-sans min-h-screen selection:bg-accent selection:text-white`}>
        {children}
        <Toaster theme="light" />
      </body>
    </html>
  );
}
