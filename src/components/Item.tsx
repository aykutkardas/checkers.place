import { ThreeEvent } from '@react-three/fiber';
import { Select } from '@react-three/postprocessing';

interface ItemProps {
  color: string;
  position: [number, number];
  selected: boolean;
  king: boolean;
  onSelect: (event: ThreeEvent<globalThis.MouseEvent>) => void;
}

const Item = ({ color, position, selected, king, onSelect }: ItemProps) => (
  <Select enabled={selected}>
    <mesh castShadow receiveShadow position={[position[0], 0.3, position[1]]} onClick={onSelect}>
      <cylinderGeometry args={king ? [0.3, 0.3, 0.2] : [0.3, 0.3, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </Select>
);

export default Item;
