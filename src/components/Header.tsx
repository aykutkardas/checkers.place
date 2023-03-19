'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 flex z-40 w-full items-center justify-between py-3 px-3">
      <a href="/" className="hover:opacity-80">
        <img src="/favicon.svg" className="w-8 drop-shadow-lg" alt="minimal checkers board view" />
      </a>
      <Link
        href="/about"
        target={pathname.startsWith('/room') ? '_blank' : '_self'}
        className="text-sm font-medium text-white hover:opacity-80 inline-flex items-center"
      >
        About
      </Link>
    </header>
  );
};

export default Header;
