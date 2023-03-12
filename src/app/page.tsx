'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { generateCode, setDataToSessionStorage } from '@/helpers';
import { Color } from '@/app/room/[id]/page';
import { realtime } from '@/libs/altogic';
import { GameType } from '@/components/Board';

const HomePage = () => {
  const [type, setType] = useState<GameType>(GameType.Turkish);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.White);
  const router = useRouter();
  const gameTypes: GameType[] = [GameType.Turkish, GameType.International];
  const colors: Color[] = [Color.White, Color.Black];

  const handleCreateRoom = (event: FormEvent) => {
    event.preventDefault();
    const roomId = generateCode();
    realtime.updateProfile({ color: selectedColor, type });
    setDataToSessionStorage('gameData', { type, color: selectedColor });
    router.push(`/room/${roomId}}`);
  };

  return (
    <section className="flex h-full items-center justify-center flex-col">
      <form className="flex flex-col gap-2" onSubmit={handleCreateRoom}>
        <div className="text-center text-white text-xl underline underline-offset-8 mb-2">Game Type</div>
        <div className="flex items-center justify-center gap-0.5">
          {gameTypes.map((gameType, id) => (
            <div className="group" key={id}>
              <input
                className="hidden [&:checked+label]:bg-neutral-600"
                id={`${gameType}-${id}`}
                type="radio"
                name="type"
                value={gameType}
                checked={type === gameType}
                onChange={(e) => setType(e.target.value as GameType)}
                required
              />
              <label
                className="cursor-pointer group-hover:bg-neutral-600 transition-colors text-white px-4 py-2 block"
                htmlFor={`${gameType}-${id}`}
              >
                {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
              </label>
            </div>
          ))}
        </div>
        <div className="text-center text-white text-xl underline underline-offset-8 mb-2">Color</div>
        <div className="flex items-center justify-center gap-0.5">
          {colors.map((color, id) => (
            <div className="group" key={id}>
              <input
                className="hidden [&:checked+label]:bg-neutral-600"
                id={`${color}-${id}`}
                type="radio"
                name="color"
                value={color}
                checked={selectedColor === color}
                onChange={(e) => setSelectedColor(e.target.value as Color)}
                required
              />
              <label
                className="cursor-pointer group-hover:bg-neutral-600 transition-colors text-white px-4 py-2 block"
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
          className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-4 text-2xl rounded-2xl"
        >
          Create Room
        </button>
      </form>
    </section>
  );
};

export default HomePage;
