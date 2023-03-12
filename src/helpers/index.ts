import { v4 as uuid } from 'uuid';
import { realtime } from '@/libs/altogic';

export function generateCode() {
  return uuid();
}

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

export function getDataFromSessionStorage<T>(key: string): T | null {
  if (typeof window !== 'undefined') {
    const item = window.sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
}

export function setDataToSessionStorage<T>(key: string, value: T) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export async function getMembers(id: string) {
  let { data } = await realtime.getMembers(id);
  data = data as { id: string; data?: {} }[];

  return {
    roomAvailable: data.length < 2,
    members: data,
  };
}
