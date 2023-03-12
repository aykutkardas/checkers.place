'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { realtime } from '@/libs/altogic';
import type { EventData } from 'altogic/src/types';

import Board from '@/components/Board';
import { copyToClipboard, getDataFromSessionStorage, getMembers } from '@/helpers';
import { GameType } from '@/app/page';

export enum Color {
  White = 'white',
  Black = 'black',
}

const COPY_TEXT_DEFAULT = 'Click to copy link';

type RoomPageProps = {
  params: {
    id: string;
  };
};

const RoomPage = ({ params: { id } }: RoomPageProps) => {
  const [pageReady, setPageReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [copyText, setCopyText] = useState(COPY_TEXT_DEFAULT);
  const [gameStarted, setGameStarted] = useState(false);

  const gameData = getDataFromSessionStorage<{ color: Color; type: GameType }>('gameData');
  const [myColor, setMyColor] = useState(gameData?.color);

  const router = useRouter();

  useEffect(() => {
    console.log({ myColor });
  }, [myColor]);

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

  const copyURL = async (url: string) => {
    await copyToClipboard(url);
    setCopyText('Copied!');
    setTimeout(() => setCopyText(COPY_TEXT_DEFAULT), 2000);
  };

  const onDisconnect = () => {
    setConnected(realtime.isConnected());
    setGameStarted(false);
  };

  const onColor = (payload: EventData) => {
    if (isMe(payload.message.socketId)) return;
    setMyColor(payload.message.gameData.color === Color.White ? Color.Black : Color.White);
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
  if (!pageReady) return null;
  return (
    <section className="py-4 flex flex-col items-center justify-evenly h-full">
      <div className="fixed right-2 top-2 text-xs text-neutral-300 flex items-center">
        Status:
        <span className={`w-3 h-3 ml-1 block rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
      </div>

      {!gameStarted && (
        <div onClick={() => copyURL(location.href)} className="flex flex-col items-center gap-3 w-full px-4">
          <div className="copy-text">{copyText}</div>
          <div className="link overflow-hidden">{location.href}</div>
          <p className="text-center text-xs text-white sm:text-xl">Send this link to your rival to connect.</p>
        </div>
      )}
      <Board currentColor={myColor} isMe={isMe} id={id} realtime={realtime} />
      <div className="flex gap-1">
        <button
          onClick={handleLeaveRoom}
          className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-2 text-2xl rounded-xl"
        >
          Leave Room
        </button>
      </div>
    </section>
  );
};

export default RoomPage;
