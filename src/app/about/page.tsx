'use client';

import Icon from '@/components/Icon';
import clsx from 'clsx';
import Image from 'next/image';

const AboutPage = () => {
  return (
    <section className="flex h-screen items-center justify-center flex-col">
      <div className={clsx('flex flex-col gap-2')}>
        <div className="text-center text-emerald-200 text-sm font-medium mb-2">CONTRIBUTORS</div>
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-10">
          <div className="flex flex-col text-white items-center justify-center gap-0.5">
            <a
              href="https://twitter.com/aykutkardas"
              target="_blank"
              rel="noreferrer"
              className="flex p-1 items-center text-sm font-normal cursor-pointer  bg-emerald-700 hover:bg-emerald-500 rounded-[50px]"
            >
              <Image
                src="https://pbs.twimg.com/profile_images/1553337736496615424/ZREU7h5C_normal.jpg"
                alt="author"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs mx-2">@aykutkardas</span>
            </a>
            <ul className="text-xs text-center [&_li]:mt-1 text-white/70">
              <li>Game Logic & Mechanics</li>
              <li>Interface Development</li>
              <li>UI & UX Design</li>
              <li className="text-white gap-x-2 inline-flex pt-2">
                <a
                  href="https://github.com/aykutkardas"
                  target="_blank"
                  rel="noreferrer"
                  className="flex p-1 items-center text-sm font-normal cursor-pointer  bg-emerald-600 hover:bg-emerald-500 rounded-[50px]"
                >
                  <Icon icon="github" size={16} />
                </a>
                <a
                  href="https://www.buymeacoffee.com/aykutkardas"
                  target="_blank"
                  rel="noreferrer"
                  className="flex p-1 items-center text-sm font-normal cursor-pointer  bg-emerald-600 hover:bg-emerald-500 rounded-[50px]"
                >
                  <Icon icon="coffee" size={16} />
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col text-white items-center justify-center gap-0.5">
            <a
              href="https://twitter.com/ozqurozalp"
              target="_blank"
              rel="noreferrer"
              className="flex p-1 items-center text-sm font-normal cursor-pointer  bg-emerald-700 hover:bg-emerald-500 rounded-[50px]"
            >
              <Image
                src="https://avatars.githubusercontent.com/u/21113261?v=4"
                alt="author"
                className="w-6 h-6 rounded-full"
                width={24}
                height={24}
              />
              <span className="text-xs mx-2">@ozqurozalp</span>
            </a>
            <ul className="text-xs text-center [&_li]:mt-1 text-white/70">
              <li>Backend Development</li>
              <li>Realtime Integration</li>
              <li className="text-white gap-x-2 inline-flex pt-2">
                <a
                  href="https://github.com/ozgurozalp"
                  target="_blank"
                  rel="noreferrer"
                  className="flex p-1 items-center text-sm font-normal cursor-pointer  bg-emerald-600 hover:bg-emerald-500 rounded-[50px]"
                >
                  <Icon icon="github" size={16} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
