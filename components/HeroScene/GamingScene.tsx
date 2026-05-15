'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FLOOR = '#0c0820';
const WALL = '#150a35';
const GLOW_TINT = '#b026ff';
const TMP_COLOR = new THREE.Color();

const GLOW_CYCLE = [
  new THREE.Color('#7a2bff'),
  new THREE.Color('#b026ff'),
  new THREE.Color('#ff2bd6'),
  new THREE.Color('#3a5aff')
];

/**
 * Minimal gaming scene: dark floor + back wall with a soft cycling
 * RGB wash behind the character (suggests off-screen monitors / LEDs).
 * No desk, no monitors, no peripherals — those come later.
 */
export const GamingScene = () => {
  const accentLightRef = useRef<THREE.PointLight | null>(null);
  const wallMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Wall gets a vertical gradient drawn to canvas — gives a subtle floor-up wash.
  const wallTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 256;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, '#0a0420');
    g.addColorStop(0.55, '#1d0c45');
    g.addColorStop(1.0, '#3a1670');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      wallTexture?.dispose();
    };
  }, [wallTexture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Cycle the accent light through purple → magenta → cyan-purple.
    const phase = t * 0.18;
    const idx = Math.floor(phase) % GLOW_CYCLE.length;
    const nextIdx = (idx + 1) % GLOW_CYCLE.length;
    const blend = phase - Math.floor(phase);
    const a = GLOW_CYCLE[idx] ?? GLOW_CYCLE[0]!;
    const b = GLOW_CYCLE[nextIdx] ?? GLOW_CYCLE[0]!;
    TMP_COLOR.copy(a).lerp(b, blend);
    const light = accentLightRef.current;
    if (light) light.color.copy(TMP_COLOR);
    const mat = wallMatRef.current;
    if (mat) {
      mat.emissive.copy(TMP_COLOR);
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={FLOOR} roughness={0.6} metalness={0.25} />
      </mesh>

      {/* Back wall — large plane behind the character */}
      <mesh position={[0, 3.0, -4.5]}>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial
          ref={wallMatRef}
          map={wallTexture ?? undefined}
          color={wallTexture ? '#ffffff' : WALL}
          roughness={0.85}
          emissive={GLOW_TINT}
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* Cool fill light from front-below — like screen glow on the kid */}
      <pointLight position={[0, 0.5, 2.5]} color={'#5aa8ff'} intensity={2.5} distance={6} decay={1.4} />

      {/* Cycling accent light behind the character (suggests RGB ambient) */}
      <pointLight
        ref={accentLightRef}
        position={[0, 1.6, -2.5]}
        color={GLOW_TINT}
        intensity={6}
        distance={9}
        decay={1.6}
      />

      {/* Hemisphere fill to keep the character from going black */}
      <hemisphereLight args={['#a87cff', '#1a0a3a', 0.45]} />
    </group>
  );
};
