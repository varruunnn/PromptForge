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
      <body className={inter.className}>
        <nav className="border-b px-8 py-4 flex gap-6 bg-white shadow-sm">
          <Link href="/" className="font-bold hover:text-blue-600">Prompt Registry</Link>
          <Link href="/playground" className="font-bold hover:text-blue-600">Playground</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}