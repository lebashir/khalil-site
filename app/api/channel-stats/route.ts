import { NextResponse } from 'next/server';
import { getChannelStats } from '@/lib/youtube-channel';

export const revalidate = 600;

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const bust = url.searchParams.get('bust') === '1';
  const stats = await getChannelStats({ bustCache: bust });
  if (!stats) {
    return NextResponse.json(
      { error: 'channel_stats_unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60' }
      }
    );
  }
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=1800'
    }
  });
};
