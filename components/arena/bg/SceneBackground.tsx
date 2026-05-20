'use client';

import type { Mode } from '@/lib/content';
import type { ArenaTheme } from '../theme';
import type { ArenaSize } from '../useArenaSize';
import { GamingBG } from './GamingBG';
import { FootballBG } from './FootballBG';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
}

// Renders the right per-mode scene behind everything. Sits fixed in the
// viewport so all sections share a single full-bleed scene.
export const SceneBackground = ({ mode, theme, size }: Props) =>
  mode === 'gaming' ? <GamingBG theme={theme} size={size} /> : <FootballBG theme={theme} size={size} />;
