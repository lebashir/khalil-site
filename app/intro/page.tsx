import type { Metadata } from 'next';
import { TunnelShell } from '@/components/tunnel/TunnelShell';
import { getContent } from '@/lib/content';
import { getRecentVideos } from '@/lib/youtube';

export const metadata: Metadata = {
  title: 'Welcome — Khalil the Goat',
  description: "Walk through Khalil's arena."
};

const IntroPage = async () => {
  const content = getContent();
  const { videos } = await getRecentVideos();
  return <TunnelShell content={content} videos={videos} />;
};

export default IntroPage;
