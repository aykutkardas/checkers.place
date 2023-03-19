'use client';

import clsx from 'clsx';

const AboutPage = () => {
  return (
    <section className="flex h-screen items-center justify-center flex-col">
      <div className={clsx('flex flex-col gap-2')}>
        <div className="text-center text-emerald-200 text-sm font-medium mb-2">CONTRIBUTORS</div>
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-10">
          <div className="flex flex-col text-white items-center justify-center gap-0.5">
            <a
              href="https://twitter.com/aykutkardas"
              target="_blank"
              rel="noreferrer"
              className="flex p-1 items-center text-sm font-normal cursor-pointer  bg-emerald-700 hover:bg-emerald-500 rounded-[50px]"
            >
              <img
                src="https://pbs.twimg.com/profile_images/1553337736496615424/ZREU7h5C_normal.jpg"
                alt="author"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs mx-2">@aykutkardas</span>
            </a>
            <ul className="text-xs text-center [&_li]:mt-1 text-white/70">
              <li>Game Logic & Mechanics</li>
              <li>Interface Development</li>
              <li>UI & UX Design</li>
            </ul>
          </div>

          <div className="flex flex-col text-white items-center justify-center gap-0.5">
            <a
              href="https://twitter.com/ozqurozalp"
              target="_blank"
              rel="noreferrer"
              className="flex p-1 items-center text-sm font-normal cursor-pointer  bg-emerald-700 hover:bg-emerald-500 rounded-[50px]"
            >
              <img
                src="https://avatars.githubusercontent.com/u/21113261?v=4"
                alt="author"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs mx-2">@ozqurozalp</span>
            </a>
            <ul className="text-xs text-center [&_li]:mt-1 text-white/70">
              <li>Backend Development</li>
              <li>Realtime Integration</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-emerald-200 text-sm font-medium mb-2 mt-8">USED TECHNOLOGIES</div>
        <div className="flex flex-wrap text-white items-center justify-center gap-3">
          <a
            href="https://www.altogic.com/?utm_source=checkers.place&amp;utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            className="h-auto w-auto opacity-100 hover:opacity-70"
          >
            <img src="/altogic.svg" alt="" className="h-8" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
