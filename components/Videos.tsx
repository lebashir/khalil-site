import { getRecentVideos } from '@/lib/youtube';
import { VideoCard } from './VideoCard';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';

const channelUrl = 'https://www.youtube.com/@khalilgaming2020';

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
      <SectionAmbient density={0.85} />
      <div className="relative z-10">
        <SectionTitle>Latest videos</SectionTitle>

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
      </div>
    </section>
  );
};
