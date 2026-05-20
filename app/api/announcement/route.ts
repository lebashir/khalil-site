import { NextResponse } from 'next/server';
import { pickActive } from '@/lib/announcement';
import { readAnnouncementsCached } from '@/lib/announcement-store';

// Public read endpoint. The homepage polls this every ~15s. Underlying
// GitHub fetch is cached at the same interval, so a busy site doesn't
// blow through the API rate limit.
export const GET = async () => {
  try {
    const file = await readAnnouncementsCached();
    const active = pickActive(file.items);
    return NextResponse.json(
      { announcement: active },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60'
        }
      }
    );
  } catch {
    // If GitHub is down or env is missing, fail open with no announcement
    // — better than a 500 that blocks the homepage poll loop.
    return NextResponse.json({ announcement: null });
  }
};
