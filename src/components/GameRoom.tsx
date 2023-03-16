'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { realtime } from '@/libs/altogic';
import type { EventData } from 'altogic/src/types';
// @ts-expect-error
import { Checkers } from 'ymir-js';
import dynamic from 'next/dynamic';

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
  const [board, setBoard] = useState(null);
  const [someOneJoined, setSomeOneJoined] = useState(false);
  const [boardMatrix, setBoardMatrix] = useState([]);
  const [activeColor, setActiveColor] = useState<Color>(Color.Black);

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
    const { Board: CheckersBoard } = type === GameType.International ? Checkers.International : Checkers.Turkish;
    const board = new CheckersBoard();
    setBoard(board);
    setBoardMatrix(board.getBoardMatrix());
    setActiveColor(Color.Black);
  }, [type]);

  useEffect(() => {
    if (get('color')) router.replace(path);
    realtime.onJoin(onJoin);
    realtime.onLeave(onLeave);
    realtime.onDisconnect(onDisconnect);

    getMembers(id).then(({ roomAvailable }) => {
      if (roomAvailable) {
        realtime.join(id);
        setPageReady(true);
      } else {
        // TODO: handle room is not available
        router.push('/');
      }
    });

    return () => {
      realtime.leave(id);
      realtime.off('channel:join', onJoin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (boardMatrix.length === 0) return;
    realtime.send(id, 'current-board-status', {
      activeColor,
      boardMatrix,
      socketId: realtime.getSocketId(),
    });
  }, [someOneJoined]);

  const isMe = (id: string) => id === realtime.getSocketId();

  const onDisconnect = () => {
    setConnected(realtime.isConnected());
    setGameStarted(false);
  };

  const onJoin = async (payload: EventData) => {
    setConnected(realtime.isConnected());
    const { members } = await getMembers(id);
    setGameStarted(members.length === 2);

    if (isMe(payload.message.id)) return;

    setSomeOneJoined((prev) => !prev);

    console.log('Someone joined to the room');
  };

  const onLeave = async (payload: EventData) => {
    setConnected(realtime.isConnected());
    if (!isMe(payload.message.id)) console.log('Someone left from the room');
    const { members } = await getMembers(id);
    setGameStarted(members.length === 2);
  };

  // TODO handle loading or error
  if (!pageReady || !board) return null;
  return (
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
      <div className="absolute top-0 left-0 w-screen h-screen">
        <Board
          boardMatrix={boardMatrix}
          setBoardMatrix={setBoardMatrix}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
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
  );
};

export default GameRoom;
