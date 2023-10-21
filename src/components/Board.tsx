import { Fragment, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AccumulativeShadows, Center, Environment, OrbitControls, RandomizedLight } from '@react-three/drei';
import { Selection, EffectComposer, Outline } from '@react-three/postprocessing';
import { Utils } from 'ymir-js';
const { parseCoord } = Utils;

import Column from '@/components/Column';
import Item from '@/components/Item';
import { Color, GameType } from '@/types';
import { socket } from '@/helpers/socket';

interface BoardProps {
  id: string;
  board: any;
  gameType?: GameType;
  gameEnd: boolean;
  gameStarted: boolean;
  setGameEnd: (value: boolean) => void;
  currentColor?: Color;
}

const Board = ({ id, gameType, board: initialBoard, currentColor, gameEnd, gameStarted, setGameEnd }: BoardProps) => {
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
    console.log('Board useEffect');
    socket.on('position', onPosition);
    socket.on('activeColor', onActiveColor);
    socket.on('activeItem', onActiveItem);
    socket.on('won', onWon);

    return () => {
      socket.off('position', onPosition);
      socket.off('activeColor', onActiveColor);
      socket.off('activeItem', onActiveItem);
      socket.off('won', onWon);
    };
  }, []);

  useEffect(() => {
    board.init();
    setBoardMatrix(board.getBoardMatrix());
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    const available = activeColor === currentColor && hovered;
    document.body.style.cursor = available ? 'pointer' : 'auto';
  }, [hovered, activeColor, currentColor]);

  useEffect(() => {
    setActiveItem(null);
  }, [activeColor]);

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
    socket.send(id, 'activeItem', {
      current: { activeItem: coord },
    });
  };

  const selectItem = (coord: string, noSend = false) => {
    if (!gameStarted) return;
    const successMoves = Object.keys(board.getAttackCoordsByColor(activeColor));

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
      socket.emit('position', {
        current: { fromCoord, toCoord },
        roomCode: id,
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
        socket.emit('activeColor', {
          current: { activeColor: newActiveColor },
          roomCode: id,
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
    if (gameEnd) return;

    const blackItems = board.getItemsByColor(Color.Black);
    const whiteItems = board.getItemsByColor(Color.White);

    const activeColorItems = activeColor === Color.Black ? blackItems : whiteItems;

    if (activeColorItems.length === 1) {
      const [lastItem] = activeColorItems;
      lastItem.setKing();
    }

    const winner = blackItems.length === 0 ? Color.White : whiteItems.length === 0 ? Color.Black : null;

    if (!winner) return;

    setGameEnd(true);

    socket.emit('won', {
      current: { winner },
      roomCode: id,
    });

    alert(`Winner is "${winner}"!`);
  }, [move, activeColor, board, gameEnd, setGameEnd, id]);

  const onPosition = ({ current }: any) => {
    moveItem(current.fromCoord, current.toCoord, true);
  };

  const onActiveColor = ({ current }: any) => {
    setActiveColor(current.activeColor);
    setActiveCoord(null);
  };

  const onActiveItem = ({ current }: any) => {
    console.log('onActiveItem', current);
    setActiveItem(board.getItem(current.activeItem));
  };

  const onWon = ({ current: { winner } }: any) => {
    if (!winner) return;
    alert(`Winner is "${winner}"!`);
  };

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
