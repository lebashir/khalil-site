import Image from 'next/image';
import { formatRelative, formatViews, getRecentVideos, type VideoItem } from '@/lib/youtube';

const youTubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const channelUrl = 'https://www.youtube.com/@khalilgaming2020';

interface VideoCardProps {
  video: VideoItem;
  featured?: boolean;
  /** index 0 (featured / first-paint) loads eagerly; everything else is lazy. */
  index: number;
}

const VideoCard = ({ video, featured, index }: VideoCardProps) => {
  // Pick the smallest thumbnail that won't look soft in the slot:
  //   - featured: high (480w) on phones, large (1280w) on desktop
  //   - side: medium (320w) on phones, high on desktop
  // Native browser srcset picks the right one for the viewport.
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
    <a
      href={youTubeUrl(video.id)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-card-border bg-card backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)]">
        {video.isLive && (
          <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white motion-safe:animate-blink">
            ● Live
          </span>
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
            // Native HTML srcset wins over Next's optimizer for our case — we want
            // the browser to pick from YouTube's prebuilt sizes (no quota cost).
            // eslint-disable-next-line @next/next/no-img-element
            {...{ srcSet }}
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20" aria-hidden />
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${featured ? 'h-16 w-16 text-2xl' : 'h-11 w-11 text-base'} flex items-center justify-center rounded-full bg-white/95 text-[#0a0420] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110`}
          aria-hidden
        >
          ▶
        </div>
      </div>
      <div className="space-y-1.5 p-4">
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
    </a>
  );
};

const EmptyState = () => (
  <div className="rounded-2xl border border-card-border bg-card p-10 text-center backdrop-blur-md">
    <p className="mb-5 text-lg text-text">
      Check back soon — Khalil&apos;s cooking up new videos.
    </p>
    <a
      href={channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-2)] px-6 py-3 font-display text-sm tracking-wide text-[#0a0420] shadow-glow transition-transform duration-300 hover:-translate-y-1"
    >
      ▶ Subscribe on YouTube
    </a>
  </div>
);

export const Videos = async () => {
  const { videos, error } = await getRecentVideos();
  const main = videos[0];
  const side = videos.slice(1, 5);

  return (
    <section id="videos" className="relative z-10 py-14">
      <h2 className="mb-7 flex items-center gap-3 font-display text-3xl tracking-wide text-text sm:text-4xl">
        <span
          className="inline-block h-3 w-3 rounded-full bg-[var(--accent-2)] motion-safe:animate-pulse"
          style={{ boxShadow: 'var(--glow)' }}
          aria-hidden
        />
        Latest videos
      </h2>

      {error || !main ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <VideoCard video={main} featured index={0} />
          <div className="flex flex-col gap-4">
            {side.map((v, i) => (
              <VideoCard key={v.id} video={v} index={i + 1} />
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-text-dim">
        Live-pulled from{' '}
        <a className="text-[var(--accent)] hover:underline" href={channelUrl} target="_blank" rel="noopener noreferrer">
          @khalilgaming2020
        </a>
      </p>
    </section>
  );
};
