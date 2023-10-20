import { io } from 'socket.io-client';
const URL = process.env.NEXT_PUBLIC_API_URL;

if (!URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');

export const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  path: '/socket-server/',
});

export const connectRoom = (roomCode: string) => {
  socket.emit('connectRoom', { roomCode });
};

export const selection = (roomCode: string, selection: number) => {
  socket.emit('selection', { roomCode, selection });
};

export const disconnectRoom = () => {
  socket.emit('disconnectRoom');
};
