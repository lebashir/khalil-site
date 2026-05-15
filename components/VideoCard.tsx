'use client';

import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, type MotionStyle } from 'framer-motion';
import { useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsHoverDevice } from '@/hooks/useIsHoverDevice';
import { formatRelative, formatViews, type VideoItem } from '@/lib/youtube';

const youTubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

interface Props {
  video: VideoItem;
  featured?: boolean;
  index: number;
}

// Video card with cursor-driven 3D tilt on hover and a slow ambient breath in idle.
// Tilt is clamped to ±10deg and only enabled on hover-pointer devices; on touch the
// card just gets the breath + hover-lift behavior the v1 site already had.
export const VideoCard = ({ video, featured, index }: Props) => {
  const reduced = useReducedMotion();
  const hover = useIsHoverDevice();
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [hovering, setHovering] = useState(false);

  const cursorX = useMotionValue(0); // -1..1
  const cursorY = useMotionValue(0);
  const sx = useSpring(cursorX, { stiffness: 140, damping: 14 });
  const sy = useSpring(cursorY, { stiffness: 140, damping: 14 });
  const rotateX = useTransform(sy, [-1, 1], [10, -10]);
  const rotateY = useTransform(sx, [-1, 1], [-10, 10]);

  const onMove = (e: React.MouseEvent) => {
    if (!hover || reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cursorX.set(Math.max(-1, Math.min(1, px * 2 - 1)));
    cursorY.set(Math.max(-1, Math.min(1, py * 2 - 1)));
  };

  const onLeave = () => {
    cursorX.set(0);
    cursorY.set(0);
    setHovering(false);
  };

  const enableTilt = hover && !reduced;
  const style: MotionStyle = enableTilt
    ? {
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 800
      }
    : {};

  const t = video.thumbnails;
  const src = featured ? t.high : t.medium;
  const srcSet = featured
    ? `${t.high} 480w, ${t.large} 1280w`
    : `${t.medium} 320w, ${t.high} 480w`;
  const sizes = featured
    ? '(max-width: 880px) 100vw, 720px'
    : '(max-width: 880px) 100vw, 360px';
  const loading: 'eager' | 'lazy' = index === 0 ? 'eager' : 'lazy';

  return (
    <motion.a
      ref={ref}
      href={youTubeUrl(video.id)}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={onMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={onLeave}
      onFocus={() => setHovering(true)}
      onBlur={onLeave}
      className="card-3d group relative block overflow-hidden rounded-2xl border border-card-border bg-card backdrop-blur-md transition-shadow duration-300 hover:shadow-glow"
      style={style}
      initial={reduced ? false : { opacity: 0, rotateY: index % 2 === 0 ? -15 : 15, y: 32 }}
      whileInView={reduced ? undefined : { opacity: 1, rotateY: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        reduced
          ? undefined
          : {
              type: 'spring',
              stiffness: 110,
              damping: 14,
              mass: 0.6,
              delay: index * 0.07
            }
      }
      animate={
        reduced || hovering
          ? undefined
          : { scale: [1, 1.005, 1], transition: { duration: 5 + (index % 3), repeat: Infinity, ease: 'easeInOut' } }
      }
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)]">
        {video.isLive && (
          <motion.span
            className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ boxShadow: '0 0 18px rgba(239,68,68,0.7)' }}
            animate={reduced ? {} : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            ● Live
          </motion.span>
        )}
        {src ? (
          <Image
            src={src}
            alt={video.title}
            fill
            sizes={sizes}
            loading={loading}
            decoding="async"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            // eslint-disable-next-line @next/next/no-img-element
            {...{ srcSet }}
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20" aria-hidden />
        <div
          className={`card-3d-inner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${featured ? 'h-16 w-16 text-2xl' : 'h-11 w-11 text-base'} flex items-center justify-center rounded-full bg-white/95 text-[#0a0420] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110`}
          style={enableTilt ? { transform: 'translate(-50%, -50%) translateZ(20px)' } : undefined}
          aria-hidden
        >
          ▶
        </div>
      </div>
      <div className="card-3d-inner space-y-1.5 p-4" style={enableTilt ? { transform: 'translateZ(10px)' } : undefined}>
        <h3 className={`${featured ? 'text-lg sm:text-xl' : 'text-base'} font-semibold leading-snug line-clamp-2`}>
          {video.title}
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-dim">
          {video.isLive ? (
            <span>● Live now</span>
          ) : (
            <>
              {video.viewCount !== null && <span>{formatViews(video.viewCount)}</span>}
              {video.publishedAt && <span>· {formatRelative(video.publishedAt)}</span>}
            </>
          )}
        </div>
      </div>
    </motion.a>
  );
};
