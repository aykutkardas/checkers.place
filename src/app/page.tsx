'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

import { GameType, Color } from '@/types';
import { createRoom } from '@/helpers';

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<GameType>(GameType.Turkish);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.Black);
  const router = useRouter();
  const gameTypes: GameType[] = [GameType.Turkish, GameType.International];
  const colors: Color[] = [Color.Black, Color.White];

  const handleCreateRoom = async () => {
    setLoading(true);
    const { success, roomCode } = await createRoom(type);
    if (success) {
      sessionStorage.setItem(
        roomCode,
        JSON.stringify({
          color: selectedColor,
          type: type,
          isCreator: true,
        }),
      );

      router.push(`/room/${roomCode}`);
    }

    setLoading(false);
  };

  return (
    <section className="flex h-screen items-center justify-center flex-col">
      <div className={clsx('flex flex-col gap-2 select-none', { 'pointer-events-none': loading })}>
        <div className="text-center text-emerald-200 text-sm font-medium">GAME TYPE</div>
        <div className="flex items-center justify-center gap-0.5">
          {gameTypes.map((gameType, id) => (
            <div
              className={clsx(
                'group-hover:border-white/50 focus:outline-emerald-300 cursor-pointer border border-transparent rounded-lg text-white transition-colors text-xs px-4 py-2 block hover:border-white/50',
                {
                  'border-white': type === gameType,
                  '!text-neutral-300 pointer-events-none': gameType === GameType.International,
                },
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
                'group-hover:border-white/50 focus:outline-emerald-300 cursor-pointer border border-transparent rounded-lg text-white transition-colors text-xs px-4 py-2 block hover:border-white/50',
                { 'border-white': selectedColor === color },
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
      </div>
    </section>
  );
};

export default HomePage;
