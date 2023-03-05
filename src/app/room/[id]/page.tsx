'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { realtime } from '@/libs/altogic';
import type { EventData } from 'altogic/src/types';

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
	const [blackCount, setBlackCount] = useState(16);
	const [whiteCount, setWhiteCount] = useState(16);
	const [isGameOver, setIsGameOver] = useState(false);
	const [isWinner, setIsWinner] = useState(false);
	const [copyText, setCopyText] = useState(COPY_TEXT_DEFAULT);
	const [url, setUrl] = useState(new URL(location.href));

	const socketId = useRef<undefined | string>(realtime.getSocketId());

	const router = useRouter();

	useEffect(() => {
		realtime.join(id);
		realtime.onConnect(onConnect);
		realtime.onJoin(onJoin);
		realtime.onDisconnect(onDisconnect);
		realtime.on('position', onPosition);
		const newURL = new URL(location.href);
		newURL.searchParams.set('color', rivalColor);
		setUrl(newURL);
		return () => {
			realtime.leave(id);
			realtime.offAny();
			realtime.off('position', onPosition);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	useEffect(() => {
		if (whiteCount === 0 || blackCount === 0) {
			setIsGameOver(true);
		}
	}, [whiteCount, blackCount]);

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
	};

	const onJoin = (payload: EventData) => {
		if (isMe(payload.message.id)) return;
		console.log('Joined room', payload);
	};

	const sendPosition = (current: { x: number; y: number }, prev?: { x: number; y: number }) => {
		realtime.send(id, 'position', {
			current,
			prev,
			socketId: socketId.current,
		});
	};

	const onPosition = (payload: EventData) => {
		const { current, prev } = payload.message;
		console.log({
			current,
			prev,
		});
	};

	const handleSendPosition = () => {
		// random position for testing
		const x = Math.floor(Math.random() * 100);
		const y = Math.floor(Math.random() * 100);
		sendPosition({ x, y }, { x: x - 1, y: y - 1 });
	};

	const handleLeaveRoom = () => {
		realtime.leave(id);
		router.push('/');
	};

	return (
		<section className="py-4 flex flex-col items-center justify-evenly h-full">
			<div className="fixed right-2 top-2 text-white">status: {connected ? 'connected' : 'disconnected'}</div>
			{isGameOver && (
				<div className="fixed inset-0 z-50 bg-white/70 flex items-center justify-center text-9xl">
					{isWinner ? 'You win' : 'You lose'}
				</div>
			)}
			<div onClick={copyURL} className="flex flex-col items-center gap-3 w-full px-4">
				<div className="copy-text">{copyText}</div>
				<div className="link">{url.toString()}</div>
				<p className="text-center text-center text-xs font-bold text-white sm:text-xl">
					Send this link to your rival to connect.
				</p>
			</div>
			<div className="flex gap-4 text-7xl text-white">
				<span className="tabular-nums">{whiteCount}</span>
				<span>-</span>
				<span className="tabular-nums">{blackCount}</span>
			</div>
			<div className="flex gap-1">
				<button
					onClick={handleLeaveRoom}
					className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-2 text-2xl rounded-xl"
				>
					Leave Room
				</button>
				<button
					onClick={handleSendPosition}
					className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-2 text-2xl rounded-xl"
				>
					Send position
				</button>
			</div>
		</section>
	);
};

export default RoomPage;
