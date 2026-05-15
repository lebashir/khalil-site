'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import type { Mode } from '@/lib/content';
import { FootballScene } from './FootballScene';
import { GamingScene } from './GamingScene';
import { Character3D } from './Character3D';
import { PixelCubes } from './PixelCubes';

interface SceneProps {
  mode: Mode;
  reducedMotion: boolean;
  narrow: boolean;
  /** Bumped on click — outer wrapper raises the gold-confetti DOM overlay. */
  onCharacterClick: () => void;
  /** Direction of an in-flight takeover, or null when idle. */
  takeover: 'g2f' | 'f2g' | null;
  /** Called when the takeover completes; the parent clears its `takeover` state. */
  onTakeoverDone: () => void;
  /** Scroll progress 0..1 for the hero section — drives the camera Z dolly. */
  scrollProgress: number;
}

const BASE_CAMERA: [number, number, number] = [0, 1.4, 5.6];
const CAMERA_LOOK: [number, number, number] = [0, 1.1, 0];

/**
 * Inner R3F scene. Two scene groups (football / gaming), one is visible at a
 * time via a hard mode-based toggle. The takeover sequence (pixel-cube burst
 * + camera shake) masks the snap.
 */
const SceneInner = ({
  mode,
  reducedMotion,
  narrow,
  onCharacterClick,
  takeover,
  onTakeoverDone,
  scrollProgress
}: SceneProps) => {
  const { camera, gl } = useThree();
  const flashRef = useRef<THREE.PointLight | null>(null);

  // Burst state drives the pixel-cube InstancedMesh. Held in a ref so the
  // timeline can drive it without re-rendering the tree.
  const burstRef = useRef({
    progress: 0,
    active: false,
    color: '#ffffff' as string,
    origin: [0, 1, 0.6] as [number, number, number]
  });
  const cameraShakeRef = useRef({ x: 0, y: 0 });
  const [, force] = useState(0);
  const repaint = () => force((n) => (n + 1) & 0xffff);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
    gl.setClearColor('#06051a', 1);
  }, [gl]);

  // Mouse parallax target — desktop only.
  const mouseTarget = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (reducedMotion) return;
    const mq = typeof window !== 'undefined'
      ? window.matchMedia('(hover: hover) and (pointer: fine)')
      : null;
    if (!mq?.matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = window.innerWidth;
        const h = window.innerHeight;
        mouseTarget.current.x = (e.clientX - w / 2) / w;
        mouseTarget.current.y = (e.clientY - h / 2) / h;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  // Per-frame: camera parallax + scroll dolly + lookAt.
  useFrame(() => {
    const shake = cameraShakeRef.current;
    if (!reducedMotion) {
      const targetX = mouseTarget.current.x * 0.55;
      const targetY = -mouseTarget.current.y * 0.25;
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        BASE_CAMERA[0] + targetX + shake.x,
        0.08
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        BASE_CAMERA[1] + targetY + shake.y,
        0.08
      );
    }
    const baseZ = BASE_CAMERA[2] + scrollProgress * 3;
    if (takeover === null) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.1);
    }
    camera.lookAt(CAMERA_LOOK[0], CAMERA_LOOK[1], CAMERA_LOOK[2]);
  });

  // Takeover orchestration: simple pixel-burst + optional camera shake.
  // The scene group swap happens immediately when the mode prop changes; the
  // burst plays at the moment of the swap to mask the cut.
  useEffect(() => {
    if (!takeover) return;
    const b = burstRef.current;
    const isF2G = takeover === 'f2g';
    b.color = isF2G ? '#b026ff' : '#ffd700';
    b.origin = [0, 1.0, 0.6];
    b.progress = 0;
    b.active = true;
    repaint();

    if (reducedMotion) {
      b.active = false;
      repaint();
      const id = window.setTimeout(onTakeoverDone, 220);
      return () => window.clearTimeout(id);
    }

    const total = narrow ? 1.0 : 1.5;
    const tl = gsap.timeline({
      onComplete: () => {
        b.active = false;
        b.progress = 0;
        cameraShakeRef.current.x = 0;
        cameraShakeRef.current.y = 0;
        repaint();
        onTakeoverDone();
      }
    });

    // Burst the pixel cubes outward.
    tl.to(b, {
      progress: 1,
      duration: total * 0.65,
      ease: 'power2.out',
      onUpdate: repaint
    }, 0);

    // Camera dolly: push in slightly, then settle.
    tl.to(camera.position, {
      z: BASE_CAMERA[2] - 0.8,
      duration: total * 0.3,
      ease: 'power2.in'
    }, 0);
    tl.to(camera.position, {
      z: BASE_CAMERA[2],
      duration: total * 0.4,
      ease: 'power2.out'
    }, total * 0.45);

    // Camera shake during the first half (desktop only).
    if (!narrow) {
      for (let i = 0; i < 5; i++) {
        tl.add(() => {
          cameraShakeRef.current.x = (Math.random() - 0.5) * 0.2;
          cameraShakeRef.current.y = (Math.random() - 0.5) * 0.15;
        }, i * 0.06);
      }
      tl.add(() => {
        cameraShakeRef.current.x = 0;
        cameraShakeRef.current.y = 0;
      }, 5 * 0.06);
    }

    // Flash on g→f finale.
    if (!isF2G) {
      tl.to(flashRef.current ?? { intensity: 0 }, {
        intensity: 10,
        duration: 0.12,
        ease: 'power3.out'
      }, total * 0.55);
      tl.to(flashRef.current ?? { intensity: 0 }, {
        intensity: 0,
        duration: 0.4,
        ease: 'power2.in'
      }, total * 0.7);
    }

    return () => {
      tl.kill();
      cameraShakeRef.current.x = 0;
      cameraShakeRef.current.y = 0;
      b.active = false;
    };
  }, [takeover, reducedMotion, narrow, camera, onTakeoverDone]);

  const b = burstRef.current;

  return (
    <>
      <fog
        attach="fog"
        args={[
          mode === 'football' ? '#6890c8' : '#0a0420',
          mode === 'football' ? 14 : 6,
          mode === 'football' ? 38 : 20
        ]}
      />

      {/* GLOBAL lighting — always-on, ensures the character is readably lit
          in both modes regardless of scene-specific mood lighting. */}
      <ambientLight intensity={0.6} color={'#ffffff'} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={2.2}
        color={'#ffffff'}
      />
      {/* Soft rim from upper back-left, gives shape to the back of the head */}
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.6}
        color={mode === 'football' ? '#ffe0a8' : '#a87cff'}
      />

      {/* Scene groups — hard-toggled by mode. Whichever is hidden has
          visible=false on the root group, so three.js skips its entire subtree. */}
      <group visible={mode === 'football'}>
        <FootballScene />
      </group>
      <group visible={mode === 'gaming'}>
        <GamingScene />
      </group>

      <Character3D
        mode={mode}
        position={[0, 0, 0.6]}
        onCharacterClick={onCharacterClick}
        bobEnabled={!takeover && !reducedMotion}
      />

      {/* Pixel burst — visible only during a takeover */}
      {b.active && (
        <PixelCubes
          progress={b.progress}
          origin={b.origin}
          color={b.color}
          count={narrow ? 30 : 60}
        />
      )}

      {/* Flash light used at the f-finale */}
      <pointLight ref={flashRef} position={[0, 3, 3]} color={'#ffffff'} intensity={0} distance={20} decay={1.2} />
    </>
  );
};

interface OuterProps extends SceneProps {}

export const Scene = (props: OuterProps) => {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows={false}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: BASE_CAMERA, fov: 52, near: 0.1, far: 80 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      <SceneInner {...props} />
    </Canvas>
  );
};
