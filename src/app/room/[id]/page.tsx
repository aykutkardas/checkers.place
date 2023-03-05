"use client";
import { usePathname, useRouter } from "next/navigation";

const RoomPage = () => {
  const pathName = usePathname();
  const router = useRouter();

  // Note: useParams not yet implemented to Next.js
  const id = pathName.replace("/room/", "");

  const handleLeaveRoom = () => {
    // TODO: Leave room
    router.push("/");
  };

  return (
    <>
      <span className="text-white">{id}</span>
      <button
        onClick={handleLeaveRoom}
        className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-4 text-2xl rounded-2xl"
      >
        Leave Room
      </button>
    </>
  );
};

export default RoomPage;
