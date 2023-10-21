'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 flex z-40 w-full items-center justify-between py-3 px-3">
      <div className="flex items-center">
        <a href="/" className="hover:opacity-80">
          <Image
            src="/favicon.svg"
            width={32}
            height={32}
            className="w-8 drop-shadow-lg"
            alt="minimal checkers board view"
          />
        </a>
        {pathname.startsWith('/room') && (
          <Link
            href="/"
            className="flex items-center gap-1 text-white font-medium text-sm hover:opacity-80 ml-2 md:hidden"
          >
            Leave Room
            <Icon icon="door-open" size={18} />
          </Link>
        )}
      </div>
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
