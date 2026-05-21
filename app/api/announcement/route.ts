import { NextResponse } from 'next/server';
import { pickActive } from '@/lib/announcement';
import { readAnnouncementsCached } from '@/lib/announcement-store';

// Public read endpoint. The homepage polls this every ~3s. Backed by
// Vercel Edge Config (sub-15ms reads at the edge), so we cache the
// response for just 2s — short enough that a fresh fire reaches every
// visitor within ~3-5s, long enough to coalesce bursts of polls.
export const GET = async () => {
  try {
    const file = await readAnnouncementsCached();
    const active = pickActive(file.items);
    return NextResponse.json(
      { announcement: active },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=10'
        }
      }
    );
  } catch {
    // If Edge Config is down or env is missing, fail open with no
    // announcement — better than a 500 that blocks the homepage poll loop.
    return NextResponse.json({ announcement: null });
  }
};
