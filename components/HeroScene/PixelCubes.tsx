'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  /** Linear 0..1 progress through the burst. 0 = at origin, 1 = fully scattered + faded. */
  progress: number;
  /** World-space center the cubes erupt from. */
  origin: [number, number, number];
  /** Tint of the cubes. */
  color: string;
  /** Number of cubes. Keep small — instanced but still GPU work per frame. */
  count?: number;
  /** Scale envelope. */
  scale?: number;
}

const TEMP_OBJ = new THREE.Object3D();
const TEMP_COLOR = new THREE.Color();

export const PixelCubes = ({ progress, origin, color, count = 60, scale = 1 }: Props) => {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  // Pre-compute per-instance direction + jitter so motion is consistent across frames.
  const seeds = useMemo(() => {
    const arr = new Array(count).fill(0).map(() => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.7 + Math.random() * 1.4;
      return {
        dx: Math.sin(phi) * Math.cos(theta) * speed,
        dy: Math.cos(phi) * speed + 0.4, // bias upward
        dz: Math.sin(phi) * Math.sin(theta) * speed,
        spin: (Math.random() - 0.5) * 12,
        size: 0.06 + Math.random() * 0.08
      };
    });
    return arr;
  }, [count]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      TEMP_COLOR.set(color);
      TEMP_COLOR.offsetHSL((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.15);
      mesh.setColorAt(i, TEMP_COLOR);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, color]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = Math.max(0, Math.min(1, progress));
    const opacity = 1 - p;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.opacity = opacity;
    material.emissiveIntensity = 1.5 * (1 - p * 0.5);

    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      if (!s) continue;
      const t = p;
      const dist = t * 3.2 * scale;
      const gravity = -1.2 * t * t;
      TEMP_OBJ.position.set(
        origin[0] + s.dx * dist,
        origin[1] + s.dy * dist + gravity,
        origin[2] + s.dz * dist
      );
      TEMP_OBJ.rotation.set(s.spin * t, s.spin * t * 0.7, s.spin * t * 0.3);
      const sizeScale = s.size * (1 - p * 0.3);
      TEMP_OBJ.scale.setScalar(sizeScale);
      TEMP_OBJ.updateMatrix();
      mesh.setMatrixAt(i, TEMP_OBJ.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const visible = progress > 0.001 && progress < 0.999;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      visible={visible}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        transparent
        opacity={1}
        roughness={0.4}
        metalness={0.1}
      />
    </instancedMesh>
  );
};
