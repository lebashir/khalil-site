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

const BASE_CAMERA: [number, number, number] = [0, 1.6, 5.8];
const CAMERA_LOOK: [number, number, number] = [0, 1, 0];

/**
 * Inner R3F scene. Lives inside a <Canvas>. Manages camera parallax, scroll dolly,
 * and the cinematic takeover via a GSAP timeline.
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
  const footballRef = useRef<THREE.Group | null>(null);
  const gamingRef = useRef<THREE.Group | null>(null);
  const ballRef = useRef<THREE.Mesh | null>(null);
  const controllerRef = useRef<THREE.Group | null>(null);
  const floodLeftRef = useRef<THREE.PointLight | null>(null);
  const floodRightRef = useRef<THREE.PointLight | null>(null);
  const monitorRefs = [
    useRef<THREE.Mesh | null>(null),
    useRef<THREE.Mesh | null>(null),
    useRef<THREE.Mesh | null>(null)
  ];
  const flashRef = useRef<THREE.PointLight | null>(null);

  // Visibilities are driven by the takeover timeline OR snap to mode otherwise.
  // We hold them in refs so the timeline can mutate them without re-rendering.
  const visRef = useRef({
    football: mode === 'football' ? 1 : 0,
    gaming: mode === 'gaming' ? 1 : 0,
    fogColor: new THREE.Color(mode === 'football' ? '#040a25' : '#0a0420'),
    fogNear: mode === 'football' ? 8 : 4,
    fogFar: mode === 'football' ? 25 : 16,
    burst: { progress: 0, kind: null as 'ball' | 'controller' | null, color: '#ffffff' },
    camera: { shakeX: 0, shakeY: 0 }
  });
  const [, force] = useState(0);
  const repaint = () => force((n) => (n + 1) & 0xffff);

  // Sync gl tone mapping + DPR clamp.
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.setClearColor('#06051a', 1);
  }, [gl]);

  // Mouse parallax — track in a ref to avoid re-renders.
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

  // Default scene state when there is no takeover — directly drives camera, fog, vis.
  useFrame((_state, delta) => {
    const v = visRef.current;

    // Mouse parallax: lerp camera position offset.
    if (!reducedMotion) {
      const targetX = mouseTarget.current.x * 0.6;
      const targetY = -mouseTarget.current.y * 0.3;
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        BASE_CAMERA[0] + targetX + v.camera.shakeX,
        0.08
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        BASE_CAMERA[1] + targetY + v.camera.shakeY,
        0.08
      );
    }

    // Scroll dolly — push camera back as the user leaves the hero.
    const baseZ = BASE_CAMERA[2] + scrollProgress * 3;
    // The takeover may add a Z offset via gsap directly on camera.position.z;
    // when no takeover is active, snap back to the base.
    if (takeover === null) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.1);
    }

    camera.lookAt(CAMERA_LOOK[0], CAMERA_LOOK[1], CAMERA_LOOK[2]);

    // Fog state — interpolated by the timeline when transitioning.
    // We apply visRef.fog* to the scene fog (set in the <fog> element via key/state).
    // Since fog is a component attr, we drive it via React state on transitions
    // (rare). For idle-no-transition state, the values are already correct.
  });

  // Takeover orchestration.
  useEffect(() => {
    if (!takeover) return;
    const v = visRef.current;
    const isF2G = takeover === 'f2g';
    const longDuration = reducedMotion ? 0.25 : narrow ? 1.0 : 1.5;
    const tl = gsap.timeline({
      onComplete: () => {
        v.burst.progress = 0;
        v.burst.kind = null;
        repaint();
        onTakeoverDone();
      }
    });

    if (reducedMotion) {
      tl.kill();
      v.football = isF2G ? 1 : 0;
      v.gaming = isF2G ? 0 : 1;
      v.fogColor.set(isF2G ? '#0a0420' : '#040a25');
      v.fogNear = isF2G ? 4 : 8;
      v.fogFar = isF2G ? 16 : 25;
      repaint();
      const timeoutId = window.setTimeout(onTakeoverDone, 220);
      return () => window.clearTimeout(timeoutId);
    }

    // Camera shake helper (only on desktop).
    const shake = () => {
      if (narrow) return;
      v.camera.shakeX = (Math.random() - 0.5) * 0.25;
      v.camera.shakeY = (Math.random() - 0.5) * 0.18;
    };
    const noShake = () => {
      v.camera.shakeX = 0;
      v.camera.shakeY = 0;
    };

    // Phase 1 (0 → 0.27 of total): focal object scales toward camera.
    // g→f: controller scales up; f→g: ball scales up.
    const focal = isF2G ? controllerRef.current : ballRef.current;

    // Set up burst meta for phase 2.
    v.burst.kind = isF2G ? 'controller' : 'ball';
    v.burst.color = isF2G ? '#b026ff' : '#ffd700';
    v.burst.progress = 0;

    // Save original focal scale to restore later.
    const focalGroup = focal as THREE.Object3D | null;
    const focalOrigScale = focalGroup ? focalGroup.scale.clone() : new THREE.Vector3(1, 1, 1);
    const focalOrigPos = focalGroup ? focalGroup.position.clone() : new THREE.Vector3();

    // PHASE 1 — focal object swells, camera pulls in slightly.
    if (focalGroup) {
      tl.to(focalGroup.scale, {
        x: 3.5, y: 3.5, z: 3.5,
        duration: longDuration * 0.27,
        ease: 'power2.in'
      }, 0);
      tl.to(focalGroup.position, {
        y: focalOrigPos.y + 0.4,
        duration: longDuration * 0.27,
        ease: 'power2.in'
      }, 0);
    }
    tl.to(camera.position, {
      z: BASE_CAMERA[2] - 1.2,
      duration: longDuration * 0.27,
      ease: 'power2.in'
    }, 0);

    // PHASE 2 — focal object fractures into pixel cubes.
    tl.add(() => {
      if (focalGroup) {
        focalGroup.scale.set(0.001, 0.001, 0.001);
      }
      v.burst.progress = 0.001;
      repaint();
    }, longDuration * 0.27);

    tl.to(v.burst, {
      progress: 1,
      duration: longDuration * 0.33,
      ease: 'power1.out',
      onUpdate: repaint
    }, longDuration * 0.27);

    // Camera shake during fracture (desktop only).
    if (!narrow) {
      for (let i = 0; i < 6; i++) {
        tl.add(shake, longDuration * 0.27 + i * 0.05);
      }
      tl.add(noShake, longDuration * 0.27 + 6 * 0.05);
    }

    // PHASE 3 — scene crossfade + fog tint.
    const target = isF2G
      ? { football: 0, gaming: 1, fogColor: '#0a0420', fogNear: 4, fogFar: 16 }
      : { football: 1, gaming: 0, fogColor: '#040a25', fogNear: 8, fogFar: 25 };

    tl.to(v, {
      football: target.football,
      gaming: target.gaming,
      fogNear: target.fogNear,
      fogFar: target.fogFar,
      duration: longDuration * 0.4,
      ease: 'power2.inOut',
      onUpdate: repaint
    }, longDuration * 0.4);

    // Tween fog color separately on the THREE.Color instance.
    tl.to(v.fogColor, {
      r: new THREE.Color(target.fogColor).r,
      g: new THREE.Color(target.fogColor).g,
      b: new THREE.Color(target.fogColor).b,
      duration: longDuration * 0.4,
      ease: 'power2.inOut',
      onUpdate: repaint
    }, longDuration * 0.4);

    // Flash burst when entering football (f finale).
    if (!isF2G) {
      tl.to(flashRef.current ? flashRef.current : { intensity: 0 }, {
        intensity: 14,
        duration: 0.12,
        ease: 'power3.out'
      }, longDuration * 0.7);
      tl.to(flashRef.current ? flashRef.current : { intensity: 0 }, {
        intensity: 0,
        duration: 0.35,
        ease: 'power2.in'
      }, longDuration * 0.82);
    }

    // PHASE 4 — restore camera, restore focal object position+scale offscreen.
    tl.to(camera.position, {
      z: BASE_CAMERA[2],
      duration: longDuration * 0.25,
      ease: 'power2.out'
    }, longDuration * 0.75);

    tl.add(() => {
      if (focalGroup) {
        focalGroup.scale.copy(focalOrigScale);
        focalGroup.position.copy(focalOrigPos);
      }
    }, longDuration * 0.95);

    return () => {
      tl.kill();
      noShake();
    };
  }, [takeover, reducedMotion, narrow, camera, onTakeoverDone]);

  // Snap visibilities to the current mode when not transitioning AND when mode finishes changing.
  useEffect(() => {
    if (takeover) return;
    const v = visRef.current;
    v.football = mode === 'football' ? 1 : 0;
    v.gaming = mode === 'gaming' ? 1 : 0;
    v.fogColor.set(mode === 'football' ? '#040a25' : '#0a0420');
    v.fogNear = mode === 'football' ? 8 : 4;
    v.fogFar = mode === 'football' ? 25 : 16;
    repaint();
  }, [mode, takeover]);

  const v = visRef.current;

  return (
    <>
      <fog
        attach="fog"
        args={[
          `#${v.fogColor.getHexString()}`,
          v.fogNear,
          v.fogFar
        ]}
      />
      <ambientLight intensity={mode === 'football' ? 0.4 : 0.2} color={mode === 'football' ? '#3a2a1a' : '#1a1a3a'} />

      <FootballScene
        ref={footballRef}
        visibility={v.football}
        ballRef={ballRef}
        floodlightLeftRef={floodLeftRef}
        floodlightRightRef={floodRightRef}
      />

      <GamingScene
        ref={gamingRef}
        visibility={v.gaming}
        controllerRef={controllerRef}
        monitorRefs={monitorRefs}
      />

      <Character3D
        mode={mode}
        position={[0, -0.1, 0.5]}
        onCharacterClick={onCharacterClick}
        bobEnabled={!takeover && !reducedMotion}
      />

      {/* Pixel-cube burst (visible only during a takeover) */}
      {v.burst.kind && (
        <PixelCubes
          progress={v.burst.progress}
          origin={[
            v.burst.kind === 'ball' ? 1.8 : 1.2,
            0,
            v.burst.kind === 'ball' ? 1.2 : -0.9
          ]}
          color={v.burst.color}
          count={narrow ? 30 : 60}
        />
      )}

      {/* Flash light used at the f-finale */}
      <pointLight ref={flashRef} position={[0, 4, 2]} color={'#ffffff'} intensity={0} distance={20} decay={1.4} />
    </>
  );
};

interface OuterProps {
  mode: Mode;
  reducedMotion: boolean;
  narrow: boolean;
  onCharacterClick: () => void;
  takeover: 'g2f' | 'f2g' | null;
  onTakeoverDone: () => void;
  scrollProgress: number;
}

export const Scene = (props: OuterProps) => {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows={false}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: BASE_CAMERA, fov: 50, near: 0.1, far: 60 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      <SceneInner {...props} />
    </Canvas>
  );
};
