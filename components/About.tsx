import type { SiteContent } from '@/lib/content';
import { renderBold } from '@/lib/bold';

interface Props {
  content: SiteContent;
}

export const About = ({ content }: Props) => (
  <section className="relative z-10 py-14">
    <h2 className="mb-7 flex items-center gap-3 font-display text-3xl tracking-wide text-text sm:text-4xl">
      <span
        className="inline-block h-3 w-3 rounded-full bg-[var(--accent-2)] motion-safe:animate-pulse"
        style={{ boxShadow: 'var(--glow)' }}
        aria-hidden
      />
      About me
    </h2>
    <div className="rounded-3xl border border-card-border bg-card p-8 backdrop-blur-md sm:p-10">
      <p className="mb-4 text-base leading-[1.8] text-text sm:text-lg">
        {renderBold(content.about.paragraph1)}
      </p>
      <p className="text-base leading-[1.8] text-text sm:text-lg">
        {renderBold(content.about.paragraph2)}
      </p>
    </div>
  </section>
);
