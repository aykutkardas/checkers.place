export type SessionStorageGameData = {
  [key: string]: RoomDetails;
};

export type SessionStorageBoardData = {
  [key: string]: [];
};

export type RoomDetails = {
  color: Color;
  type: GameType;
};

export enum Color {
  White = 'white',
  Black = 'black',
}

export enum GameType {
  Turkish = 'turkish',
  International = 'international',
}
