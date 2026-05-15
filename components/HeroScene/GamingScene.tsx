'use client';

import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  /** 0..1 — drives material opacity + monitor emissive ramp. */
  visibility: number;
  /** Ref to the controller mesh — used by the f→g takeover trigger. */
  controllerRef?: React.RefObject<THREE.Group | null>;
  /** Refs to the three monitor screens for color cycling + ramp. */
  monitorRefs?: Array<React.RefObject<THREE.Mesh | null>>;
}

const ROOM_COLOR = '#0a0420';
const DESK_COLOR = '#15102a';
const MONITOR_FRAME = '#1f1f2e';

const COLOR_CYCLE = [
  new THREE.Color('#00b8ff'),
  new THREE.Color('#b026ff'),
  new THREE.Color('#ff2bd6'),
  new THREE.Color('#5a1aff')
];

const TMP_COLOR = new THREE.Color();

/**
 * Gaming room: monitor-lit cave. The monitors themselves are the primary
 * light source — their emissive colors cycle slowly through cyan→magenta→purple,
 * and a rect-area uplight on the floor bounces magenta around the rest of the room.
 */
export const GamingScene = forwardRef<THREE.Group, Props>(
  ({ visibility, controllerRef, monitorRefs }, ref) => {
    const groupRef = useRef<THREE.Group | null>(null);
    const localMonitorRefs = useRef<Array<THREE.Mesh | null>>([null, null, null]);

    const setRef = (node: THREE.Group | null) => {
      groupRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const setMonitorRef = (i: number) => (node: THREE.Mesh | null) => {
      localMonitorRefs.current[i] = node;
      if (monitorRefs?.[i]) monitorRefs[i].current = node;
    };

    useFrame((state) => {
      const t = state.clock.elapsedTime;
      const op = Math.max(0, Math.min(1, visibility));
      const refs = localMonitorRefs.current;
      for (let i = 0; i < refs.length; i++) {
        const mesh = refs[i];
        if (!mesh) continue;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        // Slow cycle, offset per monitor so they're not in sync.
        const phase = t * 0.18 + i * 0.55;
        const idx = Math.floor(phase) % COLOR_CYCLE.length;
        const nextIdx = (idx + 1) % COLOR_CYCLE.length;
        const blend = phase - Math.floor(phase);
        const a = COLOR_CYCLE[idx] ?? COLOR_CYCLE[0]!;
        const b = COLOR_CYCLE[nextIdx] ?? COLOR_CYCLE[0]!;
        TMP_COLOR.copy(a).lerp(b, blend);
        mat.emissive.copy(TMP_COLOR);
        mat.color.copy(TMP_COLOR);
        mat.emissiveIntensity = 1.6 * op;
        mat.opacity = op;
      }
    });

    const op = Math.max(0, Math.min(1, visibility));

    return (
      <group ref={setRef} visible={op > 0.001}>
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color={ROOM_COLOR} roughness={0.75} metalness={0.1} transparent opacity={op} />
        </mesh>

        {/* Back wall */}
        <mesh position={[0, 1.6, -3.2]}>
          <planeGeometry args={[14, 6]} />
          <meshStandardMaterial color={ROOM_COLOR} roughness={0.9} transparent opacity={op} />
        </mesh>

        {/* Side walls — short stubs to suggest enclosure without boxing the camera in */}
        <mesh position={[-5, 1.6, -1]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5, 6]} />
          <meshStandardMaterial color={ROOM_COLOR} roughness={0.9} transparent opacity={op * 0.7} />
        </mesh>
        <mesh position={[5, 1.6, -1]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[5, 6]} />
          <meshStandardMaterial color={ROOM_COLOR} roughness={0.9} transparent opacity={op * 0.7} />
        </mesh>

        {/* Desk */}
        <mesh position={[0, 0.0, -1.4]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 0.1, 1.4]} />
          <meshStandardMaterial color={DESK_COLOR} roughness={0.4} metalness={0.4} transparent opacity={op} />
        </mesh>
        <mesh position={[-2.2, -0.5, -1.4]}>
          <boxGeometry args={[0.1, 1, 1.4]} />
          <meshStandardMaterial color={DESK_COLOR} roughness={0.5} transparent opacity={op} />
        </mesh>
        <mesh position={[2.2, -0.5, -1.4]}>
          <boxGeometry args={[0.1, 1, 1.4]} />
          <meshStandardMaterial color={DESK_COLOR} roughness={0.5} transparent opacity={op} />
        </mesh>

        {/* Three monitors */}
        {[
          { x: -2.2, ry: 0.28 },
          { x: 0, ry: 0 },
          { x: 2.2, ry: -0.28 }
        ].map((m, i) => (
          <group key={i} position={[m.x, 1.35, -2.8]} rotation={[0, m.ry, 0]}>
            {/* Frame */}
            <mesh>
              <boxGeometry args={[1.55, 0.95, 0.08]} />
              <meshStandardMaterial color={MONITOR_FRAME} roughness={0.4} metalness={0.6} transparent opacity={op} />
            </mesh>
            {/* Screen (emissive, animated in useFrame) */}
            <mesh ref={setMonitorRef(i)} position={[0, 0, 0.05]}>
              <planeGeometry args={[1.4, 0.8]} />
              <meshStandardMaterial
                color={'#00b8ff'}
                emissive={'#00b8ff'}
                emissiveIntensity={1.6}
                roughness={0.3}
                transparent
                opacity={op}
                toneMapped={false}
              />
            </mesh>
            {/* Stand */}
            <mesh position={[0, -0.65, 0]}>
              <boxGeometry args={[0.1, 0.4, 0.08]} />
              <meshStandardMaterial color={MONITOR_FRAME} transparent opacity={op} />
            </mesh>
            <mesh position={[0, -0.85, 0.15]}>
              <boxGeometry args={[0.5, 0.05, 0.3]} />
              <meshStandardMaterial color={MONITOR_FRAME} transparent opacity={op} />
            </mesh>
          </group>
        ))}

        {/* Controller on desk */}
        <group ref={controllerRef} position={[1.2, 0.16, -0.9]} rotation={[0, -0.3, 0]}>
          <mesh>
            <boxGeometry args={[0.55, 0.08, 0.32]} />
            <meshStandardMaterial color={'#1f1f2e'} roughness={0.5} metalness={0.3} transparent opacity={op} />
          </mesh>
          {/* Grips */}
          <mesh position={[-0.28, -0.02, 0.05]} rotation={[0, 0, 0.4]}>
            <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
            <meshStandardMaterial color={'#1f1f2e'} transparent opacity={op} />
          </mesh>
          <mesh position={[0.28, -0.02, 0.05]} rotation={[0, 0, -0.4]}>
            <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
            <meshStandardMaterial color={'#1f1f2e'} transparent opacity={op} />
          </mesh>
          {/* LED */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.06, 0.01, 0.02]} />
            <meshStandardMaterial color={'#00b8ff'} emissive={'#00b8ff'} emissiveIntensity={2.5 * op} />
          </mesh>
        </group>

        {/* Headset on desk (left side) */}
        <group position={[-1.3, 0.2, -1.0]} rotation={[0.2, 0.4, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.025, 6, 24, Math.PI]} />
            <meshStandardMaterial color={'#1f1f2e'} roughness={0.5} transparent opacity={op} />
          </mesh>
          <mesh position={[-0.18, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.06, 0.05, 4, 8]} />
            <meshStandardMaterial color={'#1f1f2e'} transparent opacity={op} />
          </mesh>
          <mesh position={[0.18, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.06, 0.05, 4, 8]} />
            <meshStandardMaterial color={'#1f1f2e'} transparent opacity={op} />
          </mesh>
        </group>

        {/* Magenta floor uplight — bounces off floor for the RGB ambient feel */}
        <pointLight position={[0, -0.3, -1]} color={'#ff2bd6'} intensity={3 * op} distance={6} decay={1.8} />
        {/* Cool fill from above */}
        <pointLight position={[0, 3, 0]} color={'#5a8aff'} intensity={0.6 * op} distance={10} decay={1.5} />
      </group>
    );
  }
);

GamingScene.displayName = 'GamingScene';
