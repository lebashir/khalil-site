// Pure helper: decides whether the editor's LOCAL theme preview diverges
// from what visitors actually see (the published settings), and produces a
// human label for the published target. Powers the /edit theme panel's
// "you're previewing X, visitors see Y" banner.
//
// Kept dependency-free + pure so it's trivially testable (see
// theme-preview.test.ts) and reusable by the React module.

export type ThemePreviewMode = 'fixed' | 'random' | 'shuffle';

export interface ThemePreviewInput {
  mode: ThemePreviewMode;
  /** Published fixed-mode key (what visitors see in FIXED mode, and the
   *  fallback for pool modes whose pool is empty). */
  fixedKey: string;
  /** Curated pool for random/shuffle modes. */
  pool: string[];
  /** The theme this browser is currently previewing locally. */
  preview: string;
}

export interface ThemePreviewStatus {
  /** True when what THIS browser shows differs from what visitors get. */
  diverged: boolean;
  /** Label describing what visitors actually see. */
  publishedLabel: string;
  /** Echoed preview key, for convenience in the UI. */
  preview: string;
}

export const themePreviewStatus = (input: ThemePreviewInput): ThemePreviewStatus => {
  const { mode, fixedKey, pool, preview } = input;
  // Pool modes only actually roll from the pool when it's non-empty;
  // otherwise the pre-paint script falls back to the fixed key (see
  // app/layout.tsx), so treat an empty pool exactly like FIXED.
  const usesPool = (mode === 'random' || mode === 'shuffle') && pool.length > 0;

  if (!usesPool) {
    return { diverged: preview !== fixedKey, publishedLabel: fixedKey, preview };
  }

  // Visitors get a (sticky or fresh) roll from the pool. The preview only
  // matches what a visitor could see if it's actually in the pool.
  const publishedLabel = `${mode} · ${pool.length} in pool`;
  return { diverged: !pool.includes(preview), publishedLabel, preview };
};
