import { ArenaShell } from '@/components/arena/ArenaShell';
import { getContent } from '@/lib/content';
import { getRecentVideos } from '@/lib/youtube';

const HomePage = async () => {
  const content = getContent();
  const { videos, error } = await getRecentVideos();
  return <ArenaShell content={content} videos={videos} videoError={error} />;
};

export default HomePage;
