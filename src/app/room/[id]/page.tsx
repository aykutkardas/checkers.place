'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { realtime } from '@/libs/altogic';
import type { EventData } from 'altogic/src/types';

import Board from '@/components/Board';

export enum Color {
	White = 'white',
	Black = 'black',
}

const COPY_TEXT_DEFAULT = 'Click to copy link';

const RoomPage = ({ params: { id } }: { params: { id: string } }) => {
	const { get } = useSearchParams();
	const myColor = get('color') as Color;
	const rivalColor = myColor === Color.White ? Color.Black : Color.White;

	const [connected, setConnected] = useState(false);
	const [copyText, setCopyText] = useState(COPY_TEXT_DEFAULT);
	const [url, setUrl] = useState(new URL(location.href));
	const [gameStarted, setGameStarterd] = useState(false);

	const socketId = useRef<undefined | string>(realtime.getSocketId());

	const router = useRouter();

	useEffect(() => {
		realtime.join(id);
		realtime.onConnect(onConnect);
		realtime.onJoin(onJoin);
		realtime.onDisconnect(onDisconnect);
		const newURL = new URL(location.href);
		newURL.searchParams.set('color', rivalColor);
		setUrl(newURL);
		return () => {
			realtime.leave(id);
			realtime.offAny();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const isMe = (id: string) => id === socketId.current;

	const copyURL = () => {
		if (!navigator.clipboard) {
			const el = document.createElement('textarea');
			el.value = url.toString();
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
		} else {
			navigator.clipboard.writeText(url.toString());
		}
		setCopyText('Copied!');
		setTimeout(() => {
			setCopyText(COPY_TEXT_DEFAULT);
		}, 2000);
	};

	const onConnect = () => {
		setConnected(true);
		socketId.current = realtime.getSocketId();
	};

	const onDisconnect = () => {
		setConnected(false);
		socketId.current = undefined;
		setGameStarterd(false);
	};

	const onJoin = (payload: EventData) => {
		setGameStarterd(true);
		if (isMe(payload.message.id)) return;
		console.log('Joined room', payload);
	};

	const handleLeaveRoom = () => {
		realtime.leave(id);
		router.push('/');
	};

	return (
		<section className="py-4 flex flex-col items-center justify-evenly h-full">
			<div className="fixed right-2 top-2 text-xs text-neutral-300 flex items-center">
				Status:
				<span className={`w-3 h-3 ml-1 block rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
			</div>

			{!gameStarted && (
				<div onClick={copyURL} className="flex flex-col items-center gap-3 w-full px-4">
					<div className="copy-text">{copyText}</div>
					<div className="link overflow-hidden">{url.toString()}</div>
					<p className="text-center text-xs text-white sm:text-xl">Send this link to your rival to connect.</p>
				</div>
			)}
			<Board currentColor={myColor} socketId={socketId} isMe={isMe} id={id} realtime={realtime} />
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
