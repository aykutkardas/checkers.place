import { ThreeEvent } from '@react-three/fiber';
import { Select } from '@react-three/postprocessing';
import { Color } from './Board';

interface ItemProps {
  color: Color;
  myColor?: Color;
  position: [number, number];
  selected: boolean;
  king: boolean;
  onSelect: (event: ThreeEvent<globalThis.MouseEvent>) => void;
  onPointerEnter: () => void;
  onPointerOut: () => void;
}

const Item = ({ color, myColor, position, selected, king, onSelect, onPointerEnter, onPointerOut }: ItemProps) => (
  <Select enabled={selected}>
    <mesh
      castShadow
      receiveShadow
      position={[position[0], 0.3, position[1]]}
      onClick={onSelect}
      onPointerEnter={myColor === color ? onPointerEnter : undefined}
      onPointerOut={myColor === color ? onPointerOut : undefined}
    >
      <cylinderGeometry args={[0.3, 0.3, king ? 0.2 : 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </Select>
);

export default Item;
