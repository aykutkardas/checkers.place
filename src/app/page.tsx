'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
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
    event.preventDefault();
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
                checked={type === gameType}
                onChange={(e) => setType(e.target.value as GameType)}
                required
              />
              <label
                className="group-hover:border-white/50 cursor-pointer rounded-md border border-transparent text-white transition-colors text-xs px-4 py-2 block"
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
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </section>
  );
};

export default HomePage;
