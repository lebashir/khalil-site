'use client';

import { useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
}

// Returns [ref, inView]. Once `inView` flips to true it stays true — Arena
// entrance animations should not replay on scroll-back.
export const useInView = <T extends HTMLElement>(opts: Options = {}): [React.RefObject<T | null>, boolean] => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold: opts.threshold ?? 0.15, rootMargin: opts.rootMargin ?? '0px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [opts.threshold, opts.rootMargin]);

  return [ref, inView];
};
