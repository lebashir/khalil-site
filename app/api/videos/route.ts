import { NextResponse } from 'next/server';
import { getRecentVideos } from '@/lib/youtube';

export const revalidate = 600; // 10 minutes

export const GET = async () => {
  const data = await getRecentVideos();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=1800' }
  });
};
