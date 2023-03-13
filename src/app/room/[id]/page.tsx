'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { realtime } from '@/libs/altogic';
import type { EventData } from 'altogic/src/types';
// @ts-expect-error
import { Checkers } from 'ymir-js';
import dynamic from 'next/dynamic';

import { getDataFromSessionStorage, getMembers } from '@/helpers';
import Invite from '@/components/Invite';
import { Color, GameType } from '@/components/Board';

const Board = dynamic(() => import('@/components/Board'), { ssr: false });

type RoomPageProps = {
  params: {
    id: string;
  };
};

const RoomPage = ({ params: { id } }: RoomPageProps) => {
  const [pageReady, setPageReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameData = getDataFromSessionStorage<{ color: Color; type: GameType }>('gameData');
  const [myColor, setMyColor] = useState(gameData?.color);
  const [board, setBoard] = useState(null);
  const [gameType, setGameType] = useState(gameData?.type);

  const router = useRouter();

  useEffect(() => {
    console.log({ myColor });
  }, [myColor]);

  useEffect(() => {
    console.log({ gameType });

    const { Board: CheckersBoard } = gameType === GameType.Turkish ? Checkers.Turkish : Checkers.International;
    const board = new CheckersBoard();
    setBoard(board);
  }, [gameType]);

  useEffect(() => {
    realtime.onJoin(onJoin);
    realtime.onLeave(onLeave);
    realtime.onDisconnect(onDisconnect);
    realtime.on('color', onColor);

    getMembers(id).then(({ roomAvailable }) => {
      if (roomAvailable) {
        realtime.join(id);
        setPageReady(true);
      } else {
        // TODO: handle room is not available
      }
    });

    return () => {
      realtime.leave(id);
      realtime.off('channel:join', onJoin);
      realtime.off('color', onColor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMe = (id: string) => id === realtime.getSocketId();

  const onDisconnect = () => {
    setConnected(realtime.isConnected());
    setGameStarted(false);
  };

  const onColor = (payload: EventData) => {
    if (isMe(payload.message.socketId)) return;
    setMyColor(payload.message.gameData.color === Color.White ? Color.Black : Color.White);
    setGameType(payload.message.gameData.type as GameType);
  };

  const onJoin = async (payload: EventData) => {
    setConnected(realtime.isConnected());
    const { members } = await getMembers(id);
    setGameStarted(members.length === 2);

    if (isMe(payload.message.id)) return;

    console.log('Someone joined to the room');
    realtime.send(id, 'color', {
      gameData,
      socketId: realtime.getSocketId(),
    });
  };

  const onLeave = async (payload: EventData) => {
    setConnected(realtime.isConnected());
    if (!isMe(payload.message.id)) console.log('Someone left from the room');
    const { members } = await getMembers(id);
    setGameStarted(members.length === 2);
  };

  const handleLeaveRoom = () => {
    router.push('/');
    realtime.leave(id);
  };

  // TODO handle loading or error
  if (!pageReady || !board) return null;
  return (
    <section className="py-4 flex flex-col items-start justify-start h-full">
      <div className="fixed z-30 px-3 top-0 left-0 flex items-center h-10 justify-between w-full">
        <button onClick={handleLeaveRoom} className="text-white font-medium text-sm p-1">
          Leave Room
        </button>
        <div className="text-xs text-white flex items-center">
          Status
          <span
            className={`ring-2 ring-white w-3 h-3 ml-2 mt-[2px] block rounded-full ${
              connected ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
        </div>
      </div>

      {!gameStarted && <Invite />}
      <div className="absolute top-0 left-0 w-screen h-screen">
        <Board
          key={board}
          gameType={gameType}
          board={board}
          currentColor={myColor}
          isMe={isMe}
          id={id}
          realtime={realtime}
        />
      </div>
      <div className="w-screen h-[50vh] bottom-0 pointer-events-none fixed bg-gradient-to-t from-emerald-800/80 to-transparent" />
    </section>
  );
};

export default RoomPage;
