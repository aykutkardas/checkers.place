'use client';

import { Color, GameType } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { isRoomExists } from '@/helpers';
import { useEffect, useState } from 'react';
import { useSessionStorage } from 'usehooks-ts';
import { connectRoom, socket } from '@/helpers/socket';
import { Checkers } from 'ymir-js';

import dynamic from 'next/dynamic';
import clsx from 'clsx';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Invite from '@/components/Invite';
import * as Toast from '@radix-ui/react-toast';

const Board = dynamic(() => import('@/components/Board'), { ssr: false });

type Storage = {
  color: Color;
  type: GameType;
  isCreator: boolean;
};

export default function RoomPage() {
  const { replace } = useRouter();
  const { id } = useParams() as { id: string };

  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);
  const [toast, setToast] = useState<{ message: string; description?: string } | null>(null);
  const [room] = useSessionStorage<Storage | undefined>(id, undefined);
  const [type, setType] = useState<GameType | undefined>(room?.type);
  const [myColor, setMyColor] = useState<Color | undefined>(room?.color);

  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('joined', onJoin);
    socket.on('gameStatus', gameStatus);
    socket.on('rivalOnLeave', rivalOnLeave);
    socket.on('rivalOnJoin', rivalOnJoin);
    socket.on('setColor', setColor);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('joined', onJoin);
      socket.off('gameStatus', gameStatus);
      socket.off('rivalOnLeave', rivalOnLeave);
      socket.off('rivalOnJoin', rivalOnJoin);
      socket.off('setColor', setColor);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (room && room.isCreator) connect();
    else checkRoom();
  }, []);
  useEffect(() => {
    let interval: number | undefined;

    if (!gameStarted) {
      interval = window.setInterval(() => {
        socket.emit('checkGameStatus', { roomCode: id });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [gameStarted]);

  function onJoin() {
    setConnected(true);
    setToast({ message: 'You have joined the room.' });
  }

  function setColor(color: Color) {
    setMyColor(color);
  }

  function rivalOnLeave() {
    alert('You won, rival left the room');
    replace('/');
  }

  function gameStatus({ status }: { status: boolean }) {
    setGameStarted(status);
    if (status) setToast({ message: 'Game Started!' });
  }

  function rivalOnJoin() {
    if (room && room?.color) {
      socket.emit('setColor', { roomCode: id, color: room.color === Color.White ? Color.Black : Color.White });
    }
  }

  async function checkRoom() {
    try {
      const { success, room } = await isRoomExists(id);
      if (!success) return replace('/');
      setType(room.type);
      connect();
    } catch {
      replace('/');
    }
  }

  function connect() {
    socket.connect();
  }

  function onConnect() {
    console.log('connected');
    connectRoom(id);
  }
  function onDisconnect() {
    setConnected(false);
    console.log('disconnected');
  }

  const CurrentGame = type === GameType.International ? Checkers.International : Checkers.Turkish;
  const { Board: CheckersBoard } = CurrentGame;
  const board = new CheckersBoard();

  if (!board) return null;
  return (
    <Toast.Provider>
      <section className="py-4 flex flex-col items-start justify-start h-screen">
        <div className="fixed z-30 p-3 bottom-1 md:top-[50%] right-0 inline-flex flex-col items-end h-10">
          <div className="text-[11px] flex items-center gap-2 mb-3 bg-white/20 px-1 py-1 rounded-xl text-white">
            <span className="ml-1">Status</span>
            <span
              className={clsx(
                `w-4 h-4 shadow-md block rounded-full bg-gradient-to-tr`,
                connected
                  ? gameStarted
                    ? 'from-emerald-400 to-emerald-200'
                    : 'from-neutral-400 to-neutral-200'
                  : 'from-rose-400 to-rose-200',
              )}
            />
          </div>
          <Link href="/" className="text-white items-center gap-1 font-medium text-sm hover:opacity-80 hidden md:flex">
            Leave Room
            <Icon icon="door-open" size={18} />
          </Link>
        </div>

        {!gameStarted && <Invite />}
        <div className="absolute top-0 left-0 w-screen h-screen select-none">
          <Board
            key={board}
            gameType={type}
            gameEnd={gameEnd}
            gameStarted={gameStarted}
            setGameEnd={setGameEnd}
            board={board}
            currentColor={myColor}
            id={id}
          />
        </div>
        <div className="w-screen h-[50vh] bottom-0 pointer-events-none fixed bg-gradient-to-t from-emerald-800/80 to-transparent" />
      </section>

      <Toast.Root
        className="fixed top-40 left-[50%] -translate-x-[50%] bg-gradient-to-t from-emerald-500 px-5 py-3 shadow-md to-emerald-400/50 text-neutral-50 rounded-xl"
        duration={3000}
        open={!!toast}
        onOpenChange={(val) => setToast(val ? toast : null)}
      >
        <Toast.Description className="text-xs">{toast?.message}</Toast.Description>
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  );
}
