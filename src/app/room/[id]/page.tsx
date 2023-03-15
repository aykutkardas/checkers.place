import { cache } from '@/libs/altogic';
import GameRoom from '@/components/GameRoom';
import { Color, GameType } from '@/components/Board';

type RoomPageProps = {
  params: {
    id: string;
  };
  searchParams: {
    color: Color;
    type: GameType;
  };
};

export type RoomDetails = { color: Color; type: GameType };
async function getRoomDetails(id: string) {
  const { data, errors } = await cache.get(id);
  if (errors) {
    // TODO: handle errors
  }

  return data as RoomDetails;
}

const RoomPage = async ({ params: { id }, searchParams: { color, type } }: RoomPageProps) => {
  let roomDetails: RoomDetails;
  let isCreator = false;
  if (!color || !type) {
    roomDetails = await getRoomDetails(id);
  } else {
    isCreator = true;
    roomDetails = { color, type };
  }
  return <GameRoom isCreator={isCreator} roomDetails={roomDetails} id={id} />;
};

export default RoomPage;
