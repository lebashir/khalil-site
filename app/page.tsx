import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArenaShell } from '@/components/arena/ArenaShell';
import { getContent } from '@/lib/content';
import { getRecentVideos } from '@/lib/youtube';
import { getChannelStats } from '@/lib/youtube-channel';
import { INTRO_COOKIE_NAME } from '@/lib/intro-cookie';

const HomePage = async () => {
  // First-visit gate. Visitors without the intro-seen cookie are bounced
  // to /intro; once they finish the tunnel (or hit ENTER on the
  // placeholder) the cookie is set and this branch falls through.
  const cookieStore = await cookies();
  if (!cookieStore.get(INTRO_COOKIE_NAME)) {
    redirect('/intro');
  }

  const content = getContent();
  const [videoResult, channelStats] = await Promise.all([
    getRecentVideos(),
    getChannelStats()
  ]);
  return (
    <ArenaShell
      content={content}
      videos={videoResult.videos}
      videoError={videoResult.error}
      channelStats={channelStats}
    />
  );
};

export default HomePage;
