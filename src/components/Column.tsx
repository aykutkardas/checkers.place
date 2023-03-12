import { MouseEvent } from 'react';
import clsx from 'clsx';
import { ThreeEvent } from '@react-three/fiber';

interface ColumnProps {
  position: [number, number];
  available: boolean;
  color: string;
  onMove: (event: ThreeEvent<globalThis.MouseEvent>) => void;
}

const Column = ({ onMove, position, color, available }: ColumnProps) => {
  return (
    <mesh position={[position[0], 0.2, position[1]]} onClick={onMove}>
      <boxGeometry args={available ? [0.99, 0.11, 0.99] : [1, 0.1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Column;
