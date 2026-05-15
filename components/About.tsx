'use client';

import { motion } from 'framer-motion';
import type { SiteContent } from '@/lib/content';
import { renderBold } from '@/lib/bold';

interface Props {
  content: SiteContent;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const paragraphVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

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
    <motion.div
      className="rounded-3xl border border-card-border bg-card p-8 backdrop-blur-md sm:p-10"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.p
        className="mb-4 text-base leading-[1.8] text-text sm:text-lg"
        variants={paragraphVariants}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {renderBold(content.about.paragraph1)}
      </motion.p>
      <motion.p
        className="text-base leading-[1.8] text-text sm:text-lg"
        variants={paragraphVariants}
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        {renderBold(content.about.paragraph2)}
      </motion.p>
    </motion.div>
  </section>
);
