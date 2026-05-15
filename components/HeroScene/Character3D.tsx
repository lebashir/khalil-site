'use client';

import { forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Mode } from '@/lib/content';

interface Props {
  mode: Mode;
  position?: [number, number, number];
  /** External click handler — the caller raises the gold-confetti DOM overlay. */
  onCharacterClick?: () => void;
  /** Idle bob is paused while a takeover is animating. */
  bobEnabled: boolean;
}

// Skin / hair / facial constants.
const SKIN = '#f4c8a0';
const HAIR = '#2a1a08';
const EYE_WHITE = '#ffffff';
const PUPIL = '#1a1a1a';
const MOUTH = '#5a2a10';

// Gaming outfit.
const GAMING_BODY = '#1a0a3a';
const GAMING_ACCENT = '#b026ff';
const GAMING_HEADSET = '#1f1f3a';
const GAMING_HEADSET_GLOW = '#00b8ff';

// Football outfit.
const FOOTBALL_BODY = '#ffffff';
const FOOTBALL_ACCENT = '#ffd700';
const FOOTBALL_STRIPE = '#0046b5';

/**
 * 3D character built from primitives. Outfit pieces (headset vs jersey crest)
 * toggle visibility on mode change. Idle bob via useFrame.
 */
export const Character3D = forwardRef<THREE.Group, Props>(
  ({ mode, position = [0, 0, 0], onCharacterClick, bobEnabled }, ref) => {
    const innerRef = useRef<THREE.Group | null>(null);
    const headRef = useRef<THREE.Group | null>(null);

    // Combine the forwarded ref + internal ref.
    const setRef = (node: THREE.Group | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    // Pre-built geometries reused across renders.
    const geos = useMemo(
      () => ({
        head: new THREE.SphereGeometry(0.48, 28, 24),
        ear: new THREE.SphereGeometry(0.09, 12, 10),
        hair: new THREE.SphereGeometry(0.5, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.5),
        body: new THREE.CapsuleGeometry(0.45, 0.7, 6, 14),
        arm: new THREE.CapsuleGeometry(0.13, 0.55, 6, 12),
        eyeWhite: new THREE.SphereGeometry(0.075, 12, 10),
        pupil: new THREE.SphereGeometry(0.035, 10, 8),
        mouth: new THREE.TorusGeometry(0.09, 0.018, 8, 18, Math.PI),
        headsetBand: new THREE.TorusGeometry(0.48, 0.04, 8, 32, Math.PI),
        headsetCup: new THREE.CapsuleGeometry(0.085, 0.08, 6, 10),
        headsetGlow: new THREE.BoxGeometry(0.12, 0.02, 0.05),
        crest: new THREE.CircleGeometry(0.12, 24),
        stripe: new THREE.BoxGeometry(0.92, 0.06, 0.02)
      }),
      []
    );

    useFrame((state) => {
      const group = innerRef.current;
      if (!group) return;
      if (bobEnabled) {
        const t = state.clock.elapsedTime;
        group.position.y = position[1] + Math.sin(t * 1.6) * 0.05;
        group.rotation.z = Math.sin(t * 0.9) * 0.02;
      } else {
        group.position.y = position[1];
        group.rotation.z = 0;
      }
      // Subtle head sway toward camera ('eye contact').
      const head = headRef.current;
      if (head) {
        const camX = state.camera.position.x;
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, camX * 0.08, 0.1);
      }
    });

    const isGaming = mode === 'gaming';

    return (
      <group ref={setRef} position={position}>
        {/* Hit target — covers the whole character. */}
        <mesh
          position={[0, 0.4, 0]}
          visible={false}
          onClick={(e) => {
            e.stopPropagation();
            onCharacterClick?.();
          }}
        >
          <boxGeometry args={[1.3, 2, 0.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Body */}
        <mesh geometry={geos.body} position={[0, 0.35, 0]} castShadow>
          <meshStandardMaterial
            color={isGaming ? GAMING_BODY : FOOTBALL_BODY}
            roughness={0.65}
            metalness={0.05}
            emissive={isGaming ? GAMING_ACCENT : '#000000'}
            emissiveIntensity={isGaming ? 0.15 : 0}
          />
        </mesh>

        {/* Football: golden stripe across chest, royal-blue panel */}
        {!isGaming && (
          <>
            <mesh geometry={geos.stripe} position={[0, 0.55, 0.4]}>
              <meshStandardMaterial color={FOOTBALL_ACCENT} emissive={FOOTBALL_ACCENT} emissiveIntensity={0.25} roughness={0.4} />
            </mesh>
            <mesh geometry={geos.crest} position={[-0.22, 0.35, 0.43]}>
              <meshStandardMaterial color={FOOTBALL_ACCENT} emissive={FOOTBALL_ACCENT} emissiveIntensity={0.4} roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[-0.22, 0.35, 0.435]}>
              <circleGeometry args={[0.06, 16]} />
              <meshStandardMaterial color={FOOTBALL_STRIPE} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}

        {/* Gaming: vertical purple stripe down hoodie */}
        {isGaming && (
          <mesh position={[0, 0.35, 0.42]}>
            <boxGeometry args={[0.18, 0.5, 0.02]} />
            <meshStandardMaterial color={GAMING_ACCENT} emissive={GAMING_ACCENT} emissiveIntensity={0.6} roughness={0.5} />
          </mesh>
        )}

        {/* Arms — capsules angled slightly outward */}
        <mesh geometry={geos.arm} position={[-0.55, 0.35, 0]} rotation={[0, 0, 0.18]}>
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>
        <mesh geometry={geos.arm} position={[0.55, 0.35, 0]} rotation={[0, 0, -0.18]}>
          <meshStandardMaterial color={SKIN} roughness={0.7} />
        </mesh>

        {/* Head group */}
        <group ref={headRef} position={[0, 1.15, 0]}>
          <mesh geometry={geos.head} castShadow>
            <meshStandardMaterial color={SKIN} roughness={0.55} metalness={0.02} />
          </mesh>

          {/* Hair cap */}
          <mesh geometry={geos.hair} position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color={HAIR} roughness={0.85} />
          </mesh>

          {/* Ears */}
          <mesh geometry={geos.ear} position={[-0.48, -0.05, 0]}>
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh geometry={geos.ear} position={[0.48, -0.05, 0]}>
            <meshStandardMaterial color={SKIN} />
          </mesh>

          {/* Eyes */}
          <mesh geometry={geos.eyeWhite} position={[-0.16, 0.02, 0.42]}>
            <meshStandardMaterial color={PUPIL} roughness={0.3} />
          </mesh>
          <mesh geometry={geos.eyeWhite} position={[0.16, 0.02, 0.42]}>
            <meshStandardMaterial color={PUPIL} roughness={0.3} />
          </mesh>
          <mesh geometry={geos.pupil} position={[-0.14, 0.04, 0.48]}>
            <meshStandardMaterial color={EYE_WHITE} />
          </mesh>
          <mesh geometry={geos.pupil} position={[0.18, 0.04, 0.48]}>
            <meshStandardMaterial color={EYE_WHITE} />
          </mesh>

          {/* Smile (half-torus rotated) */}
          <mesh
            geometry={geos.mouth}
            position={[0, -0.16, 0.42]}
            rotation={[0, 0, Math.PI]}
          >
            <meshStandardMaterial color={MOUTH} roughness={0.6} />
          </mesh>

          {/* Headset — gaming only */}
          {isGaming && (
            <>
              <mesh geometry={geos.headsetBand} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={GAMING_HEADSET} roughness={0.5} metalness={0.3} />
              </mesh>
              <mesh geometry={geos.headsetCup} position={[-0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color={GAMING_HEADSET} roughness={0.5} metalness={0.3} />
              </mesh>
              <mesh geometry={geos.headsetCup} position={[0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color={GAMING_HEADSET} roughness={0.5} metalness={0.3} />
              </mesh>
              <mesh geometry={geos.headsetGlow} position={[-0.56, 0.04, 0]}>
                <meshStandardMaterial
                  color={GAMING_HEADSET_GLOW}
                  emissive={GAMING_HEADSET_GLOW}
                  emissiveIntensity={1.4}
                />
              </mesh>
              <mesh geometry={geos.headsetGlow} position={[0.56, 0.04, 0]}>
                <meshStandardMaterial
                  color={GAMING_HEADSET_GLOW}
                  emissive={GAMING_HEADSET_GLOW}
                  emissiveIntensity={1.4}
                />
              </mesh>
            </>
          )}
        </group>
      </group>
    );
  }
);

Character3D.displayName = 'Character3D';
