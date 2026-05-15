import type { SiteContent } from '@/lib/content';

interface Props {
  content: SiteContent;
}

export const Books = ({ content }: Props) => {
  if (!content.book.visible) return null;
  return (
    <section className="relative z-10 py-14">
      <h2 className="mb-7 flex items-center gap-3 font-display text-3xl tracking-wide text-text sm:text-4xl">
        <span
          className="inline-block h-3 w-3 rounded-full bg-[var(--accent-2)] motion-safe:animate-pulse"
          style={{ boxShadow: 'var(--glow)' }}
          aria-hidden
        />
        My book
      </h2>
      <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-card-border bg-card p-8 backdrop-blur-md sm:grid-cols-[1fr_1.5fr] sm:p-10">
        <div
          className="mx-auto flex aspect-[2/3] w-full max-w-[220px] items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent-3)] p-5 text-center shadow-[-10px_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-2"
          style={{ transform: 'perspective(800px) rotateY(-15deg)' }}
        >
          <h3
            className="font-display text-2xl leading-tight tracking-wide"
            style={{ color: 'var(--bg-1)' }}
          >
            {content.book.title}
          </h3>
        </div>
        <div>
          <h3 className="mb-3 font-display text-2xl sm:text-3xl">{content.book.title}</h3>
          <p className="mb-5 text-sm leading-relaxed text-text-dim sm:text-base">
            {content.book.description}
          </p>
          <span
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-2)] px-5 py-2.5 font-display text-sm tracking-wide"
            style={{ color: 'var(--bg-1)' }}
          >
            <span aria-hidden>📖</span>
            <span>{content.book.status}</span>
          </span>
        </div>
      </div>
    </section>
  );
};
