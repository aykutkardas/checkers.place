"use client";

import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  const handleCreateRoom = () => {
    const dummyId = "1234567890";
    router.push(`/room/${dummyId}`);
  };

  return (
    <>
      <button
        onClick={handleCreateRoom}
        className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-4 text-2xl rounded-2xl"
      >
        Create Room
      </button>
    </>
  );
};

export default HomePage;
