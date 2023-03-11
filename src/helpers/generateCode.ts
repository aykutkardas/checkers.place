import { v4 as uuid } from 'uuid';

export function generateCode() {
  return uuid();
}
