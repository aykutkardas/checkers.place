import { MouseEvent } from 'react';
import clsx from 'clsx';

interface ColumnProps {
	coord: string;
	available: boolean;
	children: JSX.Element;
	onMove: (event: MouseEvent<HTMLElement>) => void;
}

const Column = ({ onMove, coord, children, available }: ColumnProps) => {
	return (
		<div
			key={coord}
			className={clsx(
				'column flex bg-[#666] items-center justify-center w-[50px] h-[50px] text-white cursor-pointer m-[1px] relative rounded-[2px]',
				{
					'bg-[#cafcca] hover:bg-[cafccacc]': available,
				},
			)}
			data-coord={coord}
			data-available={available}
			onClick={onMove}
		>
			{children}
		</div>
	);
};

export default Column;
