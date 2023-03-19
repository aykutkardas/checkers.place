import { ReactNode } from 'react';
import { Metadata } from 'next';

import Icon from '@/components/Icon';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  title: 'Checkers Online',
  description: 'It is a 3D, minimal and online checkers game.',
  icons: [
    {
      url: '/favicon.svg',
      type: 'image/svg+xml',
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen grid bg-gradient-to-b from-emerald-400 to-emerald-700">
        <header className="fixed top-0 left-0 flex z-40 w-full items-center justify-between py-3 px-3">
          <a href="/" className="hover:opacity-80">
            <img src="/favicon.svg" className="w-8 drop-shadow-lg" alt="minimal checkers board view" />
          </a>
          <Link href="/about" className="text-sm font-medium text-white hover:opacity-80 inline-flex items-center">
            About
          </Link>
        </header>
        {children}
        <footer className="fixed bottom-0 left-0 flex w-full items-center justify-center py-3">
          <a
            href="https://github.com/aykutkardas/checkers.place"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80"
          >
            <Icon icon="github" size={20} className="text-white" />
          </a>
        </footer>
      </body>
    </html>
  );
}
