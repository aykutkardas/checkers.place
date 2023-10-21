import axios from 'axios';
import { GameType } from '@/types';

export async function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return Promise.resolve();
  } else {
    await navigator.clipboard.writeText(text);
  }
}

const URL = process.env.NEXT_PUBLIC_API_URL;

if (!URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');

const END_POINT = URL.includes('api.checkers.place') ? URL : URL + '/checkers/room';

export async function isRoomExists(roomId: string) {
  const { data } = await axios.get(`${END_POINT}/exist/${roomId}`, {
    validateStatus: (status) => status < 500,
  });

  return data as {
    success: boolean;
    message: string;
    room: {
      type: GameType;
    };
  };
}

export async function createRoom(type: GameType) {
  type CreateRoomResponse = {
    roomCode: string;
    message: string;
    success: boolean;
  };
  const { data } = await axios.post<CreateRoomResponse>(
    END_POINT,
    { type },
    {
      validateStatus: (status) => status < 500,
    },
  );

  return data as CreateRoomResponse;
}
