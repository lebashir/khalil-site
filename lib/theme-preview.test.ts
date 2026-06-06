import { test, expect } from 'bun:test';
import { themePreviewStatus } from './theme-preview';

test('fixed mode: previewing the published theme is not diverged', () => {
  const s = themePreviewStatus({ mode: 'fixed', fixedKey: 'neon', pool: [], preview: 'neon' });
  expect(s.diverged).toBe(false);
  expect(s.publishedLabel).toBe('neon');
});

test('fixed mode: previewing a different theme than published is diverged', () => {
  // The real bug: browser pinned to "storm" while "neon" is published.
  const s = themePreviewStatus({ mode: 'fixed', fixedKey: 'neon', pool: [], preview: 'storm' });
  expect(s.diverged).toBe(true);
  expect(s.publishedLabel).toBe('neon');
  expect(s.preview).toBe('storm');
});

test('random mode: previewing a theme inside the pool is not diverged', () => {
  const s = themePreviewStatus({ mode: 'random', fixedKey: 'neon', pool: ['neon', 'lava'], preview: 'lava' });
  expect(s.diverged).toBe(false);
  expect(s.publishedLabel).toBe('random · 2 in pool');
});

test('random mode: previewing a theme outside the pool is diverged', () => {
  const s = themePreviewStatus({ mode: 'random', fixedKey: 'neon', pool: ['neon', 'lava'], preview: 'storm' });
  expect(s.diverged).toBe(true);
  expect(s.publishedLabel).toBe('random · 2 in pool');
});

test('pool mode with an empty pool falls back to the fixed-key comparison', () => {
  const s = themePreviewStatus({ mode: 'shuffle', fixedKey: 'neon', pool: [], preview: 'storm' });
  expect(s.diverged).toBe(true);
  expect(s.publishedLabel).toBe('neon');
});
