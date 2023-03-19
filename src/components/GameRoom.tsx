'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { realtime } from '@/libs/altogic';
import type { EventData } from 'altogic/src/types';
import * as Toast from '@radix-ui/react-toast';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import Link from 'next/link';

// @ts-expect-error
import { Checkers } from 'ymir-js';

import { getDataFromSessionStorage, getMembers } from '@/helpers';
import { Color, GameType, SessionStorageGameData } from '@/types';
import Invite from '@/components/Invite';
import Icon from '@/components/Icon';

const Board = dynamic(() => import('@/components/Board'), { ssr: false });

type GameRoomProps = {
  isCreator: boolean;
  id: string;
  roomDetails: { color: Color; type: GameType };
};

const GameRoom = ({ isCreator, id, roomDetails }: GameRoomProps) => {
  const [pageReady, setPageReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameAlreadyStarted, setGameAlreadyStarted] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);
  const [toast, setToast] = useState<{ message: string; description?: string } | null>(null);

  const [myColor] = useState<Color>(() => {
    const roomData = getDataFromSessionStorage<SessionStorageGameData>('game-data') ?? {};
    if (roomData[id]) return roomData[id].color;
    return isCreator ? roomDetails.color : roomDetails.color === Color.White ? Color.Black : Color.White;
  });
  const [type] = useState<GameType>(() => {
    const roomData = getDataFromSessionStorage<SessionStorageGameData>('game-data') ?? {};
    return roomData[id] ? roomData[id].type : roomDetails.type;
  });

  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('color')) router.replace(path);

    getMembers(id).then(({ roomAvailable }) => {
      if (roomAvailable) {
        realtime.join(id);
        setPageReady(true);
      } else {
        // TODO: handle room is not available
        router.push('/');
      }
    });

    realtime.onJoin(onJoin);
    realtime.onLeave(onLeave);
    realtime.onDisconnect(onDisconnect);

    return () => {
      realtime.leave(id);
      realtime.off('channel:join', onJoin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMe = (id: string) => id === realtime.getSocketId();

  const onDisconnect = () => {
    setConnected(realtime.isConnected());
    setGameStarted(false);
    setToast({ message: 'Disconnected' });
  };

  const onJoin = async (payload: EventData) => {
    setConnected(realtime.isConnected());
    const { members } = await getMembers(id);
    const isGameStarted = members.length === 2;
    setGameStarted(isGameStarted);

    if (isGameStarted) {
      setToast({ message: 'Game Started' });
    } else {
      setToast({ message: 'You are joined to the room' });
    }

    if (isMe(payload.message.id)) return;

    setToast({ message: 'Rival joined to the room' });
  };

  const onLeave = async (payload: EventData) => {
    if (gameEnd) return;
    setConnected(realtime.isConnected());
    if (!isMe(payload.message.id)) {
      alert('You won, rival left the room');
    }
    const { members } = await getMembers(id);
    setGameStarted(members.length === 2);

    if (members.length === 2) {
      setGameAlreadyStarted(true);
    }
  };

  const CurrentGame = type === GameType.International ? Checkers.International : Checkers.Turkish;
  const { Board: CheckersBoard } = CurrentGame;
  const board = new CheckersBoard();

  // TODO handle loading or error
  if (!pageReady || !board) return null;
  return (
    <Toast.Provider>
      <section className="py-4 flex flex-col items-start justify-start h-screen">
        <div className="fixed z-30 p-3 top-[50%] right-0 inline-flex flex-col items-end h-10">
          <Link href="/" className="text-white font-medium text-sm hover:opacity-80">
            Leave Room
            <Icon icon="door-open" size={18} className="ml-1" />
          </Link>
          <div className="text-xs flex items-center gap-2 mt-3 text-white">
            Status
            <span
              className={clsx(
                `ring-2 ring-white w-3 h-3 shadow-md block rounded-full bg-gradient-to-tr`,
                connected
                  ? gameStarted
                    ? 'from-emerald-400 to-emerald-200'
                    : 'from-neutral-400 to-neutral-200'
                  : 'from-rose-400 to-rose-200',
              )}
            />
          </div>
        </div>

        {!gameAlreadyStarted && <Invite />}
        <div className="absolute top-0 left-0 w-screen h-screen select-none">
          <Board
            key={board}
            gameType={type}
            gameEnd={gameEnd}
            setGameEnd={setGameEnd}
            board={board}
            currentColor={myColor}
            isMe={isMe}
            id={id}
            realtime={realtime}
          />
        </div>
        <div className="w-screen h-[50vh] bottom-0 pointer-events-none fixed bg-gradient-to-t from-emerald-800/80 to-transparent" />
      </section>

      <Toast.Root
        className="fixed bottom-4 right-4 bg-gradient-to-b from-emerald-600 px-5 py-3 to-transparent text-neutral-100 rounded-xl"
        duration={3000}
        open={!!toast}
        onOpenChange={(val) => setToast(val ? toast : null)}
      >
        <Toast.Description className="text-xs">{toast?.message}</Toast.Description>
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  );
};

export default GameRoom;
