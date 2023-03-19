import { ReactNode } from 'react';
import { Metadata } from 'next';

import Icon from '@/components/Icon';
import Header from '@/components/Header';

import './globals.css';

export const metadata: Metadata = {
  title: 'Checkers Place',
  description: 'It is a 3D, minimal and online checkers game.',
  icons: [
    {
      url: '/favicon.svg',
      type: 'image/svg+xml',
    },
  ],
  openGraph: {
    title: 'Checkers Place',
    description: 'It is a 3D, minimal and online checkers game.',
    url: 'https://checkers.place',
    type: 'website',
    images: [
      {
        url: 'https://checkers.place/checkers-place-og.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen grid bg-gradient-to-b from-emerald-400 to-emerald-700">
        <Header />
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
