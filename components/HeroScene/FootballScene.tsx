'use client';

import { forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  /** 0..1 — drives material opacity + light intensity for the scene crossfade. */
  visibility: number;
  /** External ref to the soccer ball (used by the takeover sequence). */
  ballRef?: React.RefObject<THREE.Mesh | null>;
  /** Pair of floodlight refs for intensity tweens. */
  floodlightLeftRef?: React.RefObject<THREE.PointLight | null>;
  floodlightRightRef?: React.RefObject<THREE.PointLight | null>;
}

const STAND_COLOR = '#0a2240';
const STAND_EMISSIVE = '#0e3a8a';
const GRASS_LIGHT = '#1f5a2a';
const GRASS_DARK = '#173f1c';

/**
 * Football stadium-at-night vibe: green pitch, navy stand silhouette,
 * two warm floodlights, soccer ball as the focal foreground object.
 */
export const FootballScene = forwardRef<THREE.Group, Props>(
  ({ visibility, ballRef, floodlightLeftRef, floodlightRightRef }, ref) => {
    const groupRef = useRef<THREE.Group | null>(null);
    const ballInnerRef = useRef<THREE.Mesh | null>(null);

    const setRef = (node: THREE.Group | null) => {
      groupRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const setBallRef = (node: THREE.Mesh | null) => {
      ballInnerRef.current = node;
      if (ballRef) ballRef.current = node;
    };

    // Pre-build stand silhouette as 11 boxes arranged in a horseshoe.
    const stands = useMemo(() => {
      const arr: Array<{ pos: [number, number, number]; rot: [number, number, number]; size: [number, number, number] }> = [];
      const segments = 11;
      const radius = 11;
      for (let i = 0; i < segments; i++) {
        const t = i / (segments - 1);
        const angle = -Math.PI * 0.85 + t * Math.PI * 1.7;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius;
        arr.push({
          pos: [x, 1.2, z],
          rot: [0, -angle, 0],
          size: [3.2, 2.4, 0.8]
        });
      }
      return arr;
    }, []);

    useFrame((state) => {
      const ball = ballInnerRef.current;
      if (ball) {
        const t = state.clock.elapsedTime;
        ball.rotation.y = t * 0.4;
        ball.position.y = -0.15 + Math.sin(t * 1.2) * 0.04;
      }
    });

    // Crossfade: when visibility = 0, everything is transparent/invisible.
    const op = Math.max(0, Math.min(1, visibility));

    return (
      <group ref={setRef} visible={op > 0.001}>
        {/* Sky dome — large inverted sphere with a deep navy gradient feel via fog */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[40, 24, 16]} />
          <meshBasicMaterial
            color={'#040a25'}
            side={THREE.BackSide}
            transparent
            opacity={op}
            depthWrite={false}
          />
        </mesh>

        {/* Pitch — flat plane with grass tones */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[40, 40, 1, 1]} />
          <meshStandardMaterial
            color={GRASS_LIGHT}
            roughness={0.95}
            metalness={0}
            transparent
            opacity={op}
          />
        </mesh>

        {/* Pitch dark strip (creates a sense of marked field) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 2]}>
          <planeGeometry args={[40, 6, 1, 1]} />
          <meshStandardMaterial
            color={GRASS_DARK}
            roughness={0.95}
            transparent
            opacity={op * 0.6}
          />
        </mesh>

        {/* Stand silhouette */}
        {stands.map((s, i) => (
          <mesh key={i} position={s.pos} rotation={s.rot} castShadow>
            <boxGeometry args={s.size} />
            <meshStandardMaterial
              color={STAND_COLOR}
              emissive={STAND_EMISSIVE}
              emissiveIntensity={0.18}
              roughness={0.8}
              transparent
              opacity={op}
            />
          </mesh>
        ))}

        {/* Floodlight masts (left + right) */}
        {[-4.5, 4.5].map((x, i) => (
          <group key={i} position={[x, 0, -7]}>
            <mesh position={[0, 2.4, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 5, 6]} />
              <meshStandardMaterial color={'#1a1a2e'} transparent opacity={op} />
            </mesh>
            <mesh position={[0, 5, 0]}>
              <boxGeometry args={[0.6, 0.3, 0.3]} />
              <meshStandardMaterial
                color={'#1a1a2e'}
                emissive={'#fff5b8'}
                emissiveIntensity={1.2 * op}
                transparent
                opacity={op}
              />
            </mesh>
          </group>
        ))}

        {/* Floodlights — actual point lights doing the lighting work */}
        <pointLight
          ref={floodlightLeftRef}
          position={[-4.5, 5.5, -7]}
          color={'#fff5b8'}
          intensity={op * 30}
          distance={28}
          decay={1.6}
          castShadow={false}
        />
        <pointLight
          ref={floodlightRightRef}
          position={[4.5, 5.5, -7]}
          color={'#fff5b8'}
          intensity={op * 30}
          distance={28}
          decay={1.6}
          castShadow={false}
        />

        {/* Soccer ball — focal foreground object */}
        <mesh ref={setBallRef} position={[1.8, -0.15, 1.2]} castShadow>
          <sphereGeometry args={[0.32, 24, 18]} />
          <meshStandardMaterial
            color={'#f8f8f8'}
            roughness={0.45}
            metalness={0.05}
            transparent
            opacity={op}
          />
        </mesh>
        {/* Ball pentagons (cheap dark spots) */}
        {[
          [0, 1, 0],
          [0.7, 0.4, 0.6],
          [-0.7, 0.4, 0.6],
          [0, 0.4, -1],
          [0.7, -0.5, 0.5],
          [-0.7, -0.5, 0.5]
        ].map((n, i) => {
          const len = Math.hypot(n[0]!, n[1]!, n[2]!);
          const nx = n[0]! / len;
          const ny = n[1]! / len;
          const nz = n[2]! / len;
          const r = 0.32;
          return (
            <mesh
              key={i}
              position={[1.8 + nx * r * 0.96, -0.15 + ny * r * 0.96, 1.2 + nz * r * 0.96]}
              rotation={[Math.acos(ny), Math.atan2(nx, nz), 0]}
            >
              <circleGeometry args={[0.06, 5]} />
              <meshStandardMaterial color={'#0a0420'} side={THREE.DoubleSide} transparent opacity={op} />
            </mesh>
          );
        })}
      </group>
    );
  }
);

FootballScene.displayName = 'FootballScene';
