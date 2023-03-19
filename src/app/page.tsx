'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import clsx from 'clsx';

import { generateCode, getDataFromSessionStorage, setDataToSessionStorage } from '@/helpers';
import { cache, realtime } from '@/libs/altogic';
import { GameType, Color } from '@/types';

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<GameType>(GameType.Turkish);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.Black);
  const router = useRouter();
  const gameTypes: GameType[] = [GameType.Turkish, GameType.International];
  const colors: Color[] = [Color.Black, Color.White];

  const handleCreateRoom = async (event: FormEvent) => {
    setLoading(true);
    const roomId = generateCode();
    realtime.updateProfile({ color: selectedColor, type });
    setDataToSessionStorage('game-data', {
      ...(getDataFromSessionStorage('game-data') ?? {}),
      [roomId]: { color: selectedColor, type },
    });
    await cache.set(roomId, { type, color: selectedColor }, 1800);
    router.push(`/room/${roomId}?color=${selectedColor}&type=${type}`);
  };

  return (
    <section className="flex h-screen items-center justify-center flex-col">
      <form className={clsx('flex flex-col gap-2', { 'pointer-events-none': loading })} onSubmit={handleCreateRoom}>
        <div className="text-center text-emerald-200 text-sm font-medium">GAME TYPE</div>
        <div className="flex items-center justify-center gap-0.5">
          {gameTypes.map((gameType, id) => (
            <div
              className={clsx(
                'group-hover:border-white/50 focus:outline-emerald-300 cursor-pointer rounded-md border border-transparent text-white transition-colors text-xs px-4 py-2 block',
                { 'border border-transparent border-white rounded-lg': type === gameType },
              )}
              role="button"
              tabIndex={0}
              onClick={(e) => setType(gameType)}
              key={id}
            >
              {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
            </div>
          ))}
        </div>
        <div className="text-center text-emerald-200 text-sm font-medium mt-3">COLOR</div>
        <div className="flex items-center justify-center gap-0.5">
          {colors.map((color, id) => (
            <div
              role="button"
              className={clsx(
                'group-hover:border-white/50 focus:outline-emerald-300 cursor-pointer rounded-md border border-transparent text-white transition-colors text-xs px-4 py-2 block',
                { 'border border-transparent border-white rounded-lg': selectedColor === color },
              )}
              onClick={(e) => setSelectedColor(color)}
              tabIndex={0}
              key={id}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={handleCreateRoom}
          className={clsx(
            'bg-gradient-to-t from-emerald-500 to-emerald-400 focus:outline-emerald-300 shadow-lg border-none transition-all text-neutral-100 mt-5 font-medium block py-2 text-lg rounded-xl',
            loading ? 'scale-[1.1] opacity-80' : 'hover:scale-[1.1]',
          )}
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </section>
  );
};

export default HomePage;
