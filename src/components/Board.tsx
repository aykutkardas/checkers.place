import { Fragment, memo, MouseEvent, MutableRefObject, useCallback, useEffect, useState } from 'react';
import { EventData, RealtimeManager } from 'altogic';
// @ts-expect-error
import { Checkers, Utils } from 'ymir-js';
import { Canvas } from '@react-three/fiber';
import { AccumulativeShadows, Center, Environment, OrbitControls, RandomizedLight } from '@react-three/drei';

const { Board: CheckersBoard } = Checkers.Turkish;
const { useCoord } = Utils;

import { Color } from '@/app/room/[id]/page';

import Column from '@/components/Column';
import Item from '@/components/Item';
import { GameType } from '@/app/page';

interface BoardProps {
  id: string;
  board: any;
  gameType?: GameType;
  currentColor?: Color;
  isMe: (id: string) => boolean;
  realtime: RealtimeManager;
}

const Board = ({ id, gameType, board, currentColor, isMe, realtime }: BoardProps) => {
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

  const handleSelectItem = (coord: string) => {
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
          socketId: realtime.getSocketId(),
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
            socketId: realtime.getSocketId(),
          });
        }
        setActiveCoord(null);
        setTurn(turn + 1);
      } else {
        board.selectItem(toCoord);
      }

      setMove(move + 1);
    },
    [activeColor, id, move, realtime, turn],
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

  const getCoord = (coord: string): [number, number] => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [x, y] = useCoord(coord);
    const gap = gameType === GameType.Turkish ? 3.5 : 4.5;
    return [x - gap, y - gap];
  };

  return (
    <Canvas
      shadows
      camera={{
        fov: 60,
        near: 0.5,
        far: 30,
        position: [0, 15, 8],
      }}
    >
      <Environment preset="city" />
      <OrbitControls makeDefault />

      <Center top>
        <group rotation-y={currentColor === Color.White ? Math.PI / 2 : -Math.PI / 2}>
          {/* Board */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={gameType === GameType.Turkish ? [8, 0.3, 8] : [10, 0.3, 10]} />
            <meshStandardMaterial color="#b3b3b3" />
          </mesh>

          {boardMatrix.map((row: { coord: string; item: IItem }[], index: number) => (
            <Fragment key={index}>
              {row.map(({ coord, item }, colIndex) => (
                <Fragment key={coord}>
                  <Column
                    available={availableColumns.includes(coord)}
                    position={getCoord(coord)}
                    onMove={() => {
                      if (!availableColumns.includes(coord)) return;
                      moveItem(activeCoord, coord);
                    }}
                    color={
                      availableColumns.includes(coord)
                        ? '#10b981'
                        : index % 2
                        ? colIndex % 2
                          ? '#aaaaaa'
                          : '#c4c4c4'
                        : colIndex % 2
                        ? '#c4c4c4'
                        : '#aaaaaa'
                    }
                  />
                  {item && (
                    <Item
                      selected={item.selected}
                      king={item.king}
                      color={item.color}
                      position={getCoord(coord)}
                      onSelect={() => handleSelectItem(coord)}
                    />
                  )}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </group>
        <AccumulativeShadows temporal frames={1} color="#9d4b4b" colorBlend={0.1} alphaTest={0.1} scale={1}>
          <RandomizedLight amount={1} radius={1} position={[5, 5, 10]} />
        </AccumulativeShadows>
      </Center>
    </Canvas>
  );
};

export default Board;
