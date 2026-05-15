'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  /** External ref to the soccer ball (used by the takeover sequence). */
  ballRef?: React.RefObject<THREE.Mesh | null>;
}

const GRASS = '#2a7a3a';
const GRASS_LINE = '#e8efe6';

/**
 * Minimal football scene: turf + sky gradient backdrop + a soccer ball
 * at the character's feet. No stadium. Just "outdoors, daytime, pitch."
 */
export const FootballScene = ({ ballRef }: Props) => {
  const ballInnerRef = useRef<THREE.Mesh | null>(null);

  const setBallRef = (node: THREE.Mesh | null) => {
    ballInnerRef.current = node;
    if (ballRef) ballRef.current = node;
  };

  // Sky gradient — drawn once to a canvas, used as a sphere-backdrop texture.
  const skyTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 256;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, '#0a1f55');   // top: deep blue
    g.addColorStop(0.45, '#3678c8'); // mid: bright blue
    g.addColorStop(0.8, '#9bc4e8');  // horizon: pale blue
    g.addColorStop(1.0, '#f0d68a');  // bottom: warm sunset wash
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      skyTexture?.dispose();
    };
  }, [skyTexture]);

  useFrame((state) => {
    const ball = ballInnerRef.current;
    if (ball) {
      const t = state.clock.elapsedTime;
      ball.rotation.y = t * 0.4;
      ball.position.y = 0.18 + Math.sin(t * 1.4) * 0.03;
    }
  });

  return (
    <group>
      {/* Sky dome — large inverted sphere with the gradient texture. */}
      <mesh>
        <sphereGeometry args={[40, 32, 24]} />
        <meshBasicMaterial
          map={skyTexture ?? undefined}
          color={skyTexture ? '#ffffff' : '#3678c8'}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Turf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={GRASS} roughness={0.95} metalness={0} />
      </mesh>

      {/* A single white pitch line for context */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -1.4]}>
        <planeGeometry args={[60, 0.08]} />
        <meshStandardMaterial color={GRASS_LINE} roughness={0.95} />
      </mesh>

      {/* Soccer ball — sits next to the character on the turf */}
      <mesh ref={setBallRef} position={[0.95, 0.18, 0.55]} castShadow>
        <sphereGeometry args={[0.18, 24, 18]} />
        <meshStandardMaterial color={'#f8f8f8'} roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Dark pentagon spots — three simple discs on the ball */}
      {[
        [0, 1, 0],
        [0.7, 0.3, 0.7],
        [-0.6, 0.2, 0.7]
      ].map((n, i) => {
        const len = Math.hypot(n[0]!, n[1]!, n[2]!);
        const nx = n[0]! / len;
        const ny = n[1]! / len;
        const nz = n[2]! / len;
        const r = 0.18;
        return (
          <mesh
            key={i}
            position={[0.95 + nx * r * 0.97, 0.18 + ny * r * 0.97, 0.55 + nz * r * 0.97]}
            rotation={[Math.acos(ny), Math.atan2(nx, nz), 0]}
          >
            <circleGeometry args={[0.045, 5]} />
            <meshStandardMaterial color={'#1a1a26'} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Warm sun — directional light from upper-back-right, tinted yellow */}
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.6}
        color={'#fff2c8'}
      />
      {/* Cool sky fill — hemisphere light from above */}
      <hemisphereLight args={['#bcd6ff', '#3a6a3a', 0.65]} />
    </group>
  );
};
