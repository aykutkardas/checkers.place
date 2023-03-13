'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { generateCode, setDataToSessionStorage } from '@/helpers';
import { realtime } from '@/libs/altogic';
import { Color, GameType } from '@/components/Board';
import clsx from 'clsx';

const HomePage = () => {
  const [type, setType] = useState<GameType>(GameType.Turkish);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.Black);
  const router = useRouter();
  const gameTypes: GameType[] = [GameType.Turkish, GameType.International];
  const colors: Color[] = [Color.Black, Color.White];

  const handleCreateRoom = (event: FormEvent) => {
    event.preventDefault();
    const roomId = generateCode();
    realtime.updateProfile({ color: selectedColor, type });
    setDataToSessionStorage('gameData', { type, color: selectedColor });
    router.push(`/room/${roomId}}`);
  };

  return (
    <section className="flex h-screen items-center justify-center flex-col">
      <form className="flex flex-col gap-2" onSubmit={handleCreateRoom}>
        <div className="text-center text-emerald-200 text-sm font-medium">GAME TYPE</div>
        <div className="flex items-center justify-center gap-0.5">
          {gameTypes.map((gameType, id) => (
            <div className="group" key={id}>
              <input
                className="hidden border border-transparent [&:checked+label]:border-white rounded-lg"
                id={`${gameType}-${id}`}
                type="radio"
                name="type"
                value={gameType}
                disabled={gameType === GameType.International}
                checked={type === gameType}
                onChange={(e) => setType(e.target.value as GameType)}
                required
              />
              <label
                className={clsx(
                  'cursor-pointer rounded-md border border-transparent text-white transition-colors text-xs px-4 py-2 block',
                  {
                    'group-hover:border-white/50': gameType !== GameType.International,
                    '!cursor-not-allowed text-white/70': gameType === GameType.International,
                  },
                )}
                htmlFor={`${gameType}-${id}`}
              >
                {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
              </label>
            </div>
          ))}
        </div>
        <div className="text-center text-emerald-200 text-sm font-medium mt-3">COLOR</div>
        <div className="flex items-center justify-center gap-0.5">
          {colors.map((color, id) => (
            <div className="group" key={id}>
              <input
                className="hidden border border-transparent [&:checked+label]:border-white rounded-lg"
                id={`${color}-${id}`}
                type="radio"
                name="color"
                value={color}
                checked={selectedColor === color}
                onChange={(e) => setSelectedColor(e.target.value as Color)}
                required
              />
              <label
                className="cursor-pointer rounded-md border border-transparent group-hover:border-white/50 text-white transition-colors text-xs px-4 py-2 block"
                htmlFor={`${color}-${id}`}
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          onClick={handleCreateRoom}
          className="bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg hover:scale-[1.1] border-none transition-all text-neutral-100 mt-5 font-medium block py-2 text-lg rounded-xl"
        >
          Create Room
        </button>
      </form>
    </section>
  );
};

export default HomePage;
