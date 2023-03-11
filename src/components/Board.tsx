import { MouseEvent, MutableRefObject, useCallback, useEffect, useState } from 'react';
import { EventData, RealtimeManager } from 'altogic';
import clsx from 'clsx';
// @ts-expect-error
import { Checkers, Utils } from 'ymir-js';

const { Board: CheckersBoard } = Checkers.Turkish;
const { useCoord } = Utils;

import { Color } from '@/app/room/[id]/page';

import Column from '@/components/Column';
import Item from '@/components/Item';

const board = new CheckersBoard();

interface BoardProps {
	id: string;
	currentColor: string;
	socketId: MutableRefObject<string | undefined>;
	isMe: (id: string) => boolean;
	realtime: RealtimeManager;
}

const Board = ({ id, currentColor, socketId, isMe, realtime }: BoardProps) => {
	const [turn, setTurn] = useState(0);
	const [move, setMove] = useState(0);
	const [activeColor, setActiveColor] = useState<Color>(Color.Black);
	const [activeCoord, setActiveCoord] = useState<string | null>(null);
	const [boardMatrix, setBoardMatrix] = useState(board.getBoardMatrix());
	const [availableColumns, setAvailableColumns] = useState<string[]>([]);

	useEffect(() => {
		board.init();
		setBoardMatrix(board.getBoardMatrix());
	}, []);

	useEffect(() => {
		if (!activeCoord || activeColor !== currentColor) {
			setAvailableColumns([]);
		} else {
			const activeItem = board.getItem(activeCoord);
			if (!activeItem) return;

			const columns = board.getAvailableColumns(activeCoord, activeItem.movement);
			setAvailableColumns(columns);
		}
	}, [activeCoord, activeColor, currentColor]);

	const selectItem = (coord: string) => {
		if (activeColor !== currentColor) return;
		const activeItem = board.getItem(coord);

		const successMoves = Object.keys(board.getAttackCoordsByColor(activeColor));

		if (successMoves.length && !successMoves.includes(coord)) {
			selectItem(successMoves[0]);
			return;
		}

		if (activeItem?.color !== activeColor) return;

		board.deselectAllItems();
		board.selectItem(coord);

		setActiveCoord(coord);
	};

	const handleSelectItem = ({ target }: MouseEvent<HTMLElement>) => {
		// @ts-expect-error [TODO]
		const { coord } = target.dataset;
		selectItem(coord);
	};

	const moveItem = useCallback(
		(fromCoord: string | null, toCoord: string, noSend?: boolean) => {
			console.log('moveItem');
			// eslint-disable-next-line react-hooks/rules-of-hooks
			const [toRowId] = useCoord(toCoord);

			if (toRowId === 0 || toRowId === 7) {
				const activeItem = board.getItem(fromCoord);
				activeItem.setKing();
			}

			const coordsOfDestoryItems = board.getItemsBetweenTwoCoords(fromCoord, toCoord);

			const destroyedAnyItemsThisTurn = coordsOfDestoryItems.length > 0;

			board.moveItem(fromCoord, toCoord);

			if (!noSend) {
				realtime.send(id, 'position', {
					current: { fromCoord, toCoord },
					socketId: socketId.current,
				});
			}

			if (destroyedAnyItemsThisTurn) {
				coordsOfDestoryItems.forEach((coord: string) => {
					board.removeItem(coord);
				});
			}

			board.deselectAllItems();
			setBoardMatrix(board.getBoardMatrix());
			setActiveCoord(toCoord);

			const successMoves = Object.keys(board.getAttackCoordsByColor(activeColor)).filter(
				(moveCoord) => moveCoord === toCoord,
			);

			if (!destroyedAnyItemsThisTurn || (destroyedAnyItemsThisTurn && !successMoves.length)) {
				const newActiveColor = activeColor === Color.White ? Color.Black : Color.White;
				setActiveColor(newActiveColor);

				if (!noSend) {
					realtime.send(id, 'activeColor', {
						current: { activeColor: newActiveColor },
						socketId: socketId.current,
					});
				}
				setActiveCoord(null);
				setTurn(turn + 1);
			} else {
				board.selectItem(toCoord);
			}

			setMove(move + 1);
		},
		[activeColor, id, move, realtime, socketId, turn],
	);

	const handleMoveItem = ({ target }: MouseEvent<HTMLElement>) => {
		// @ts-expect-error [TODO]
		const { coord } = target.dataset;

		if (!availableColumns.includes(coord)) return;

		moveItem(activeCoord, coord);
	};

	useEffect(() => {
		const activeColorItems = board.getItemsByColor(activeColor);

		if (activeColorItems.length === 1) {
			const [lastItem] = activeColorItems;
			lastItem.setKing();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [move]);

	const onPosition = useCallback(
		(payload: EventData) => {
			if (isMe(payload.message.socketId)) return;
			const { current } = payload.message;
			moveItem(current.fromCoord, current.toCoord, true);
		},
		[isMe, moveItem],
	);

	const onActiveColor = useCallback(
		(payload: EventData) => {
			if (isMe(payload.message.socketId)) return;
			const { current } = payload.message;
			setActiveColor(current.activeColor);
			setActiveCoord(null);
			setTurn(turn + 1);
		},
		[isMe, turn],
	);

	useEffect(() => {
		realtime.on('position', onPosition);
		realtime.on('activeColor', onActiveColor);

		return () => {
			realtime.off('position', onPosition);
			realtime.off('activeColor', onActiveColor);
		};
	}, [id, onActiveColor, onPosition, realtime]);

	interface IItem {
		color: Color;
		king: boolean;
		selected: boolean;
	}

	return (
		<>
			<div
				className={clsx(
					'[&_.row:nth-child(odd)_&_.column:nth-child(odd)]:bg-[#555] [&_.row:nth-child(event)_&_.column:nth-child(event)]:bg-[#555]',
					{
						'rotate-180': currentColor === 'white',
					},
				)}
			>
				{boardMatrix.map((row: { coord: string; item: IItem }[], index: number) => (
					<div key={index} className="row flex w-full">
						{row.map(({ coord, item }) => (
							<Column key={coord} coord={coord} available={availableColumns.includes(coord)} onMove={handleMoveItem}>
								{item && (
									<Item
										color={item.color}
										king={item.king}
										selected={item.selected}
										coord={coord}
										onSelect={handleSelectItem}
									/>
								)}
							</Column>
						))}
					</div>
				))}
			</div>
		</>
	);
};

export default Board;
