import { MouseEvent } from 'react';
import clsx from 'clsx';

interface ItemProps {
	color: string;
	coord: string;
	selected: boolean;
	king: boolean;
	onSelect: (event: MouseEvent<HTMLElement>) => void;
}

const Item = ({ color, coord, selected, king, onSelect }: ItemProps) => {
	return (
		<div
			className={clsx(
				'flex items-center justify-center absolute w-[30px] h-[30px] rounded-full z-10',
				'before:contet-[""] before:relative before:w-3 before:h-3 before:rounded-full',
				{
					'bg-black before:bg-[#222]': color === 'black',
					'bg-white before:bg-[#eee]': color === 'white',
					'ring-2 ring-amber-300 z-20': selected,
					'before:bg-amber-400': king,
				},
			)}
			onClick={onSelect}
			data-coord={coord}
			data-color={color}
			data-selected={selected}
			data-king={king}
		/>
	);
};

export default Item;
