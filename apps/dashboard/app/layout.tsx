import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptForge Dashboard",
  description: "AI Prompt Observability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#07090F] text-slate-100 antialiased min-h-screen`}>
        <nav className="fixed top-0 left-0 right-0 z-50 h-[52px] border-b border-white/[0.05] bg-[#07090F]/90 backdrop-blur-xl flex items-center px-6 gap-1">
          <div className="flex items-center gap-2.5 mr-8">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="1.5" width="4" height="4" rx="0.8" fill="white" fillOpacity="0.95"/>
                <rect x="7.5" y="1.5" width="4" height="4" rx="0.8" fill="white" fillOpacity="0.7"/>
                <rect x="1.5" y="7.5" width="4" height="4" rx="0.8" fill="white" fillOpacity="0.7"/>
                <rect x="7.5" y="7.5" width="4" height="4" rx="0.8" fill="white" fillOpacity="0.5"/>
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-white">PromptForge</span>
          </div>

          <Link href="/" className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-all duration-150 rounded-md hover:bg-white/[0.06]">
            Registry
          </Link>
          <Link href="/playground" className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-all duration-150 rounded-md hover:bg-white/[0.06]">
            Playground
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-400/[0.08] border border-emerald-400/20 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
              Gateway · live
            </div>
          </div>
        </nav>

        <div className="pt-[52px]">
          {children}
        </div>
      </body>
    </html>
  );
}