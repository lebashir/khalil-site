'use client';

import { useEffect, useMemo, useRef } from 'react';
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

// Common palette.
const SKIN = '#f4c8a0';
const HAIR = '#2a1a08';
const PUPIL = '#1a1a1a';
const MOUTH = '#5a2a10';
const SHOE = '#1a1a1f';

// Gaming outfit.
const HOODIE = '#3a1670';            // dark purple hoodie body
const HOODIE_HOOD = '#2a0f55';       // hood (darker)
const HOODIE_DRAW = '#ff2bd6';       // magenta drawstring tips
const HEADSET = '#1a1a26';
const HEADSET_GLOW = '#00b8ff';
const GAMING_PANTS = '#181028';      // dark indigo joggers

// Football outfit.
const JERSEY = '#ffffff';
const JERSEY_TRIM = '#ffd700';       // gold accent stripe
const JERSEY_BLUE = '#003876';       // royal blue secondary
const SHORTS = '#ffffff';
const SOCK = '#003876';

/**
 * Roblox-style chibi kid built from primitives. Stocky kid proportions
 * (head ~1/4 of body height), short limbs. Outfit pieces toggle visibility
 * by mode — hoodie + headset for gaming, jersey + shorts + "7" for football.
 */
export const Character3D = ({ mode, position = [0, 0, 0], onCharacterClick, bobEnabled }: Props) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const headPivotRef = useRef<THREE.Group | null>(null);

  // "7" decal — tiny canvas texture, made once.
  const sevenTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = JERSEY_TRIM;
    ctx.font = 'bold 110px "Russo One", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('7', 64, 72);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Clean up texture on unmount.
  useEffect(() => {
    return () => {
      sevenTexture?.dispose();
    };
  }, [sevenTexture]);

  useFrame((state) => {
    const group = groupRef.current;
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
    const head = headPivotRef.current;
    if (head) {
      const camX = state.camera.position.x;
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, camX * 0.08, 0.1);
    }
  });

  const isGaming = mode === 'gaming';
  const isFootball = mode === 'football';

  // Y reference points — character pivot at y=0, character grows upward.
  // Feet bottom: y=0.0
  // Legs:        y=0.05 to y=0.85
  // Torso:       y=0.85 to y=1.50
  // Neck:        y=1.50 to y=1.62
  // Head:        y=1.62 to y=2.30 (sphere center at 1.96, r=0.34)

  return (
    <group ref={groupRef} position={position}>
      {/* Hit target — big invisible box covering the whole character */}
      <mesh
        position={[0, 1.1, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onCharacterClick?.();
        }}
      >
        <boxGeometry args={[1.4, 2.4, 0.8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ====== FEET (shoes) — always visible ====== */}
      <mesh position={[-0.18, 0.06, 0.08]}>
        <boxGeometry args={[0.24, 0.12, 0.36]} />
        <meshStandardMaterial color={SHOE} roughness={0.7} />
      </mesh>
      <mesh position={[0.18, 0.06, 0.08]}>
        <boxGeometry args={[0.24, 0.12, 0.36]} />
        <meshStandardMaterial color={SHOE} roughness={0.7} />
      </mesh>

      {/* ====== LEGS — football: shorts + bare skin legs + socks ====== */}
      {isFootball && (
        <>
          {/* Bare skin lower legs (calves) */}
          <mesh position={[-0.18, 0.45, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.55, 14]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          <mesh position={[0.18, 0.45, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.55, 14]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          {/* Royal-blue socks (band around lower calf) */}
          <mesh position={[-0.18, 0.21, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.18, 14]} />
            <meshStandardMaterial color={SOCK} roughness={0.7} />
          </mesh>
          <mesh position={[0.18, 0.21, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.18, 14]} />
            <meshStandardMaterial color={SOCK} roughness={0.7} />
          </mesh>
          {/* White shorts — short box covering hips */}
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[0.58, 0.3, 0.42]} />
            <meshStandardMaterial color={SHORTS} roughness={0.55} />
          </mesh>
        </>
      )}

      {/* ====== LEGS — gaming: full purple joggers ====== */}
      {isGaming && (
        <>
          <mesh position={[-0.18, 0.5, 0]}>
            <cylinderGeometry args={[0.14, 0.13, 0.85, 14]} />
            <meshStandardMaterial color={GAMING_PANTS} roughness={0.85} />
          </mesh>
          <mesh position={[0.18, 0.5, 0]}>
            <cylinderGeometry args={[0.14, 0.13, 0.85, 14]} />
            <meshStandardMaterial color={GAMING_PANTS} roughness={0.85} />
          </mesh>
          {/* Magenta cuff highlight at ankles */}
          <mesh position={[-0.18, 0.14, 0]}>
            <cylinderGeometry args={[0.145, 0.145, 0.06, 14]} />
            <meshStandardMaterial color={HOODIE_DRAW} emissive={HOODIE_DRAW} emissiveIntensity={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0.18, 0.14, 0]}>
            <cylinderGeometry args={[0.145, 0.145, 0.06, 14]} />
            <meshStandardMaterial color={HOODIE_DRAW} emissive={HOODIE_DRAW} emissiveIntensity={0.4} roughness={0.6} />
          </mesh>
        </>
      )}

      {/* ====== TORSO — mode-tinted block ====== */}
      <mesh position={[0, 1.18, 0]}>
        <boxGeometry args={[0.7, 0.65, 0.42]} />
        <meshStandardMaterial
          color={isGaming ? HOODIE : JERSEY}
          roughness={isGaming ? 0.85 : 0.6}
          metalness={0.02}
        />
      </mesh>

      {/* ====== ARMS — sleeves + skin hands ====== */}
      {/* Upper arm — matches torso material */}
      <mesh position={[-0.46, 1.18, 0]} rotation={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.11, 0.1, 0.5, 12]} />
        <meshStandardMaterial
          color={isGaming ? HOODIE : JERSEY}
          roughness={isGaming ? 0.85 : 0.6}
        />
      </mesh>
      <mesh position={[0.46, 1.18, 0]} rotation={[0, 0, -0.04]}>
        <cylinderGeometry args={[0.11, 0.1, 0.5, 12]} />
        <meshStandardMaterial
          color={isGaming ? HOODIE : JERSEY}
          roughness={isGaming ? 0.85 : 0.6}
        />
      </mesh>
      {/* Forearm — skin */}
      <mesh position={[-0.49, 0.78, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.35, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      <mesh position={[0.49, 0.78, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.35, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      {/* Hands (small spheres) */}
      <mesh position={[-0.49, 0.58, 0]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.65} />
      </mesh>
      <mesh position={[0.49, 0.58, 0]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.65} />
      </mesh>

      {/* ====== Football jersey accents ====== */}
      {isFootball && (
        <>
          {/* Gold horizontal stripe across upper chest */}
          <mesh position={[0, 1.38, 0.215]}>
            <boxGeometry args={[0.72, 0.07, 0.005]} />
            <meshStandardMaterial
              color={JERSEY_TRIM}
              emissive={JERSEY_TRIM}
              emissiveIntensity={0.4}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          {/* Royal-blue accent stripes on sleeves */}
          <mesh position={[-0.46, 1.34, 0]} rotation={[0, 0, 0.04]}>
            <cylinderGeometry args={[0.111, 0.108, 0.08, 12]} />
            <meshStandardMaterial color={JERSEY_BLUE} roughness={0.55} />
          </mesh>
          <mesh position={[0.46, 1.34, 0]} rotation={[0, 0, -0.04]}>
            <cylinderGeometry args={[0.111, 0.108, 0.08, 12]} />
            <meshStandardMaterial color={JERSEY_BLUE} roughness={0.55} />
          </mesh>
          {/* "7" decal — plane with the canvas texture, on the chest */}
          {sevenTexture && (
            <mesh position={[0, 1.13, 0.215]}>
              <planeGeometry args={[0.32, 0.32]} />
              <meshStandardMaterial
                map={sevenTexture}
                transparent
                roughness={0.5}
                emissive={JERSEY_TRIM}
                emissiveMap={sevenTexture}
                emissiveIntensity={0.5}
              />
            </mesh>
          )}
        </>
      )}

      {/* ====== Gaming hoodie accents ====== */}
      {isGaming && (
        <>
          {/* Hoodie pocket (front-front) */}
          <mesh position={[0, 1.02, 0.22]}>
            <boxGeometry args={[0.42, 0.18, 0.01]} />
            <meshStandardMaterial color={HOODIE_HOOD} roughness={0.85} />
          </mesh>
          {/* Drawstring lines (two thin verticals) */}
          <mesh position={[-0.07, 1.36, 0.22]}>
            <boxGeometry args={[0.02, 0.18, 0.005]} />
            <meshStandardMaterial color={HOODIE_DRAW} emissive={HOODIE_DRAW} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.07, 1.36, 0.22]}>
            <boxGeometry args={[0.02, 0.18, 0.005]} />
            <meshStandardMaterial color={HOODIE_DRAW} emissive={HOODIE_DRAW} emissiveIntensity={0.5} />
          </mesh>
          {/* Drawstring tips (small magenta spheres) */}
          <mesh position={[-0.07, 1.26, 0.225]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={HOODIE_DRAW} emissive={HOODIE_DRAW} emissiveIntensity={1} />
          </mesh>
          <mesh position={[0.07, 1.26, 0.225]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={HOODIE_DRAW} emissive={HOODIE_DRAW} emissiveIntensity={1} />
          </mesh>
        </>
      )}

      {/* ====== Neck — small skin cylinder ====== */}
      <mesh position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.12, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.65} />
      </mesh>

      {/* ====== HEAD GROUP — rotates toward camera ====== */}
      <group ref={headPivotRef} position={[0, 1.96, 0]}>
        {/* Head sphere */}
        <mesh>
          <sphereGeometry args={[0.36, 28, 24]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Hair cap — top quarter sphere, sits on head */}
        <mesh position={[0, 0.04, 0]} rotation={[0, 0, 0]}>
          <sphereGeometry
            args={[0.38, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.45]}
          />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        {/* Side hair tufts (chunky bangs) */}
        <mesh position={[-0.2, 0.15, 0.27]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        <mesh position={[0.2, 0.15, 0.27]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.36, -0.02, 0]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <mesh position={[0.36, -0.02, 0]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>

        {/* Eyes — flat-faced dark spheres, slightly offset */}
        <mesh position={[-0.12, 0.04, 0.32]}>
          <sphereGeometry args={[0.055, 14, 12]} />
          <meshStandardMaterial color={PUPIL} roughness={0.3} />
        </mesh>
        <mesh position={[0.12, 0.04, 0.32]}>
          <sphereGeometry args={[0.055, 14, 12]} />
          <meshStandardMaterial color={PUPIL} roughness={0.3} />
        </mesh>
        {/* Eye sparkles (tiny white dots) */}
        <mesh position={[-0.105, 0.058, 0.37]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color={'#ffffff'} />
        </mesh>
        <mesh position={[0.135, 0.058, 0.37]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color={'#ffffff'} />
        </mesh>

        {/* Smile — small open-arc torus */}
        <mesh position={[0, -0.11, 0.31]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.07, 0.014, 8, 14, Math.PI]} />
          <meshStandardMaterial color={MOUTH} roughness={0.6} />
        </mesh>

        {/* ====== Gaming: hood at back of head + headset ====== */}
        {isGaming && (
          <>
            {/* Hood — large back-half cap drooping behind head */}
            <mesh position={[0, 0.0, -0.04]}>
              <sphereGeometry
                args={[0.44, 24, 20, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.55]}
              />
              <meshStandardMaterial color={HOODIE_HOOD} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
            {/* Hood neck flare (small triangle drop at back) */}
            <mesh position={[0, -0.25, -0.18]} rotation={[Math.PI / 6, 0, 0]}>
              <coneGeometry args={[0.28, 0.32, 8, 1, true]} />
              <meshStandardMaterial color={HOODIE_HOOD} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>

            {/* Headset band — half torus over head */}
            <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.36, 0.035, 8, 24, Math.PI]} />
              <meshStandardMaterial color={HEADSET} roughness={0.4} metalness={0.45} />
            </mesh>
            {/* Earcups */}
            <mesh position={[-0.36, 0.0, 0]}>
              <boxGeometry args={[0.1, 0.18, 0.16]} />
              <meshStandardMaterial color={HEADSET} roughness={0.4} metalness={0.45} />
            </mesh>
            <mesh position={[0.36, 0.0, 0]}>
              <boxGeometry args={[0.1, 0.18, 0.16]} />
              <meshStandardMaterial color={HEADSET} roughness={0.4} metalness={0.45} />
            </mesh>
            {/* Cyan glow stripes on earcups */}
            <mesh position={[-0.41, 0.04, 0]}>
              <boxGeometry args={[0.015, 0.04, 0.1]} />
              <meshStandardMaterial color={HEADSET_GLOW} emissive={HEADSET_GLOW} emissiveIntensity={1.6} />
            </mesh>
            <mesh position={[0.41, 0.04, 0]}>
              <boxGeometry args={[0.015, 0.04, 0.1]} />
              <meshStandardMaterial color={HEADSET_GLOW} emissive={HEADSET_GLOW} emissiveIntensity={1.6} />
            </mesh>
            {/* Mic boom — thin cylinder forward of left cup, ending in magenta tip */}
            <mesh position={[-0.36, -0.08, 0.18]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.012, 0.012, 0.24, 8]} />
              <meshStandardMaterial color={HEADSET} roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[-0.21, -0.18, 0.25]}>
              <sphereGeometry args={[0.03, 10, 8]} />
              <meshStandardMaterial color={HOODIE_DRAW} emissive={HOODIE_DRAW} emissiveIntensity={1.6} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
};
