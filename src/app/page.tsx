'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { generateCode } from '@/helpers/generateCode';
import { Color } from '@/app/room/[id]/page';

const HomePage = () => {
	const [type, setType] = useState<'turkish' | 'other'>('turkish');
	const [color, setColor] = useState<Color>(Color.White);
	const router = useRouter();

	const handleCreateRoom = () => {
		const roomId = generateCode();
		router.push(`/room/${roomId}?type=${type}&color=${color}`);
	};

	return (
		<section className="flex h-full items-center justify-center flex-col">
			<button
				onClick={handleCreateRoom}
				className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-4 text-2xl rounded-2xl"
			>
				Create Room
			</button>
		</section>
	);
};

export default HomePage;
