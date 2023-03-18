'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { realtime } from '@/libs/altogic';
import type { EventData } from 'altogic/src/types';
// @ts-expect-error
import { Checkers } from 'ymir-js';
import dynamic from 'next/dynamic';
import * as Toast from '@radix-ui/react-toast';

import { getDataFromSessionStorage, getMembers } from '@/helpers';
import Invite from '@/components/Invite';
import clsx from 'clsx';
import Link from 'next/link';
import { Color, GameType, SessionStorageGameData } from '@/types';

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
  const [toast, setToast] = useState<{ title: string; description?: string } | null>(null);

  const [myColor] = useState<Color>(() => {
    const roomData = getDataFromSessionStorage<SessionStorageGameData>('room-data') ?? {};
    if (roomData[id]) return roomData[id].color;
    return isCreator ? roomDetails.color : roomDetails.color === Color.White ? Color.Black : Color.White;
  });
  const [type] = useState<GameType>(() => {
    const roomData = getDataFromSessionStorage<SessionStorageGameData>('room-data') ?? {};
    return roomData[id] ? roomData[id].type : roomDetails.type;
  });

  const path = usePathname();
  const router = useRouter();
  const { get } = useSearchParams();

  useEffect(() => {
    if (get('color')) router.replace(path);

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
    setToast({ title: 'Disconnected', description: 'You are disconnected from the server' });
  };

  const onJoin = async (payload: EventData) => {
    setConnected(realtime.isConnected());
    const { members } = await getMembers(id);
    const isGameStarted = members.length === 2;
    setGameStarted(isGameStarted);

    if (isGameStarted) {
      setToast({ title: 'Game Started', description: 'Game is started with another player' });
    } else {
      setToast({ title: 'Joined', description: 'You are joined to the room' });
    }

    if (isMe(payload.message.id)) return;

    setToast({ title: 'Joined', description: 'Another player joined to the room' });
  };

  const onLeave = async (payload: EventData) => {
    setConnected(realtime.isConnected());
    if (!isMe(payload.message.id)) {
      setToast({ title: 'Left', description: 'Another player left the room' });
    }
    const { members } = await getMembers(id);
    setGameStarted(members.length === 2);
  };

  const CurrentGame = type === GameType.International ? Checkers.International : Checkers.Turkish;
  const { Board: CheckersBoard } = CurrentGame;
  const board = new CheckersBoard();

  // TODO handle loading or error
  if (!pageReady || !board) return null;
  return (
    <Toast.Provider>
      <section className="py-4 flex flex-col items-start justify-start h-screen">
        <div className="fixed z-30 px-3 top-0 left-0 flex items-center h-10 justify-between w-full">
          <Link href="/" className="text-white font-medium text-sm p-1">
            Leave Room
          </Link>
          <div className="text-xs flex items-center gap-2 text-white">
            Status
            <span
              className={clsx(
                `ring-2 ring-white w-3 h-3 shadow-md block rounded-full bg-gradient-to-tr`,
                connected ? 'from-emerald-400 to-emerald-200' : 'from-rose-400 to-rose-200',
              )}
            />
          </div>
        </div>

        {!gameStarted && <Invite />}
        <div className="absolute top-0 left-0 w-screen h-screen select-none">
          <Board
            key={board}
            gameType={type}
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
        className="fixed bottom-3 right-3 px-4 py-2 bg-neutral-50 text-neutral-700 rounded-xl shadow-lg"
        duration={3000}
        open={!!toast}
        onOpenChange={(val) => setToast(val ? toast : null)}
      >
        <Toast.Title className="font-medium text-neutral-900">{toast?.title}</Toast.Title>
        <Toast.Description className="text-xs">{toast?.description}</Toast.Description>
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  );
};

export default GameRoom;
