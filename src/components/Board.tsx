import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { EventData, RealtimeManager } from 'altogic';
// @ts-expect-error
import { Utils } from 'ymir-js';
import { Canvas } from '@react-three/fiber';
import { AccumulativeShadows, Center, Environment, OrbitControls, RandomizedLight } from '@react-three/drei';
import { Selection, EffectComposer, Outline } from '@react-three/postprocessing';
const { parseCoord } = Utils;

import Column from '@/components/Column';
import Item from '@/components/Item';
import { Color, GameType } from '@/types';

interface BoardProps {
  id: string;
  board: any;
  gameType?: GameType;
  currentColor?: Color;
  realtime: RealtimeManager;
  isMe: (id: string) => boolean;
}

const Board = ({ id, gameType, board: initialBoard, currentColor, realtime, isMe }: BoardProps) => {
  const [board] = useState(initialBoard);
  const [hovered, setHovered] = useState(false);
  const [turn, setTurn] = useState(0);
  const [move, setMove] = useState(0);
  const [activeCoord, setActiveCoord] = useState<string | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [boardMatrix, setBoardMatrix] = useState([]);
  const [activeColor, setActiveColor] = useState<Color>(Color.Black);
  const [activeItem, setActiveItem] = useState<IItem | null>(null);

  useEffect(() => {
    board.init();
    setBoardMatrix(board.getBoardMatrix());
  }, []);

  useEffect(() => {
    const available = activeColor === currentColor && hovered;
    document.body.style.cursor = available ? 'pointer' : 'auto';
  }, [hovered]);

  useEffect(() => {
    if (!activeCoord || activeColor !== currentColor) {
      setAvailableColumns([]);
    } else {
      const activeItem = board.getItem(activeCoord);
      if (!activeItem) return;

      const columns = board.getAvailableColumns(activeCoord, activeItem.movement);
      setAvailableColumns(columns);
    }
  }, [activeCoord, activeColor]);

  const sendActiveItem = (coord: string) => {
    realtime.send(id, 'activeItem', {
      current: { activeItem: coord },
      socketId: realtime.getSocketId(),
    });
  };

  const selectItem = (coord: string, noSend = false) => {
    const successMoves = Object.keys(board.getAttackCoordsByColor(activeColor));

    console.log(successMoves);

    if (successMoves.length && !successMoves.includes(coord)) {
      selectItem(successMoves[0]);
      !noSend && sendActiveItem(successMoves[0]);
      return;
    }

    board.deselectAllItems();
    board.selectItem(coord);

    setActiveCoord(coord);
    setActiveItem(board.getItem(coord));

    !noSend && sendActiveItem(coord);
  };

  const handleSelectItem = (coord: string) => {
    const activeItemColor = board.getItem(coord).color;
    if (activeItemColor === activeColor && activeColor === currentColor) {
      selectItem(coord);
    }
  };

  const moveItem = (fromCoord: string | null, toCoord: string, noSend?: boolean) => {
    const [toRowId] = parseCoord(toCoord);
    const bottomEdge = 0;
    const topEdge = gameType === GameType.Turkish ? 7 : 9;

    if (toRowId === bottomEdge || toRowId === topEdge) {
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
  };

  useEffect(() => {
    const activeColorItems = board.getItemsByColor(activeColor);

    if (activeColorItems.length === 1) {
      const [lastItem] = activeColorItems;
      lastItem.setKing();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [move]);

  const onPosition = (payload: EventData) => {
    if (isMe(payload.message.socketId)) return;
    const { current } = payload.message;
    moveItem(current.fromCoord, current.toCoord, true);
  };

  const onActiveColor = (payload: EventData) => {
    if (isMe(payload.message.socketId)) return;
    const { current } = payload.message;
    setActiveColor(current.activeColor);
    setActiveCoord(null);
  };

  const onActiveItem = (payload: EventData) => {
    if (isMe(payload.message.socketId)) return;
    console.log(payload.message);
    const { current } = payload.message;
    setActiveItem(board.getItem(current.activeItem));
  };

  useEffect(() => {
    realtime.on('position', onPosition);
    realtime.on('activeColor', onActiveColor);
    realtime.on('activeItem', onActiveItem);

    return () => {
      realtime.off('position', onPosition);
      realtime.off('activeColor', onActiveColor);
      realtime.off('activeItem', onActiveItem);
    };
  }, []);

  interface IItem {
    color: Color;
    king: boolean;
    selected: boolean;
  }

  const getCoord = (coord: string): [number, number] => {
    const [x, y] = parseCoord(coord);
    const gap = gameType === GameType.Turkish ? 3.5 : 4.5;
    return [x - gap, y - gap];
  };

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{
        fov: 60,
        near: 0.5,
        far: 30,
        position: [0, 10, 13],
        zoom: 1.3,
      }}
    >
      <Environment preset="city" />
      <OrbitControls
        enablePan={false}
        makeDefault
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI * 0.25}
        maxAzimuthAngle={Math.PI * 0.25}
        minDistance={10}
        maxDistance={20}
      />
      <Selection>
        <EffectComposer multisampling={500} autoClear={false}>
          <Outline blur edgeStrength={100} width={1500} />
        </EffectComposer>

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
                      onPointerEnter={() => setHovered(true)}
                      onPointerOut={() => setHovered(false)}
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
                        myColor={currentColor}
                        selected={item.selected || activeItem === item}
                        king={item.king}
                        color={item.color}
                        position={getCoord(coord)}
                        onSelect={() => handleSelectItem(coord)}
                        onPointerEnter={() => setHovered(true)}
                        onPointerOut={() => setHovered(false)}
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
      </Selection>
    </Canvas>
  );
};

export default Board;
