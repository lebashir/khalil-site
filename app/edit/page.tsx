import { cookies } from 'next/headers';
import { getContent } from '@/lib/content';
import { SESSION_COOKIE, verifyToken } from '@/lib/edit-session';
import { getRecentVideos } from '@/lib/youtube';
import { getChannelStats } from '@/lib/youtube-channel';
import { LoginForm } from '@/components/edit/LoginForm';
import { ControlDeck } from '@/components/edit/deck/ControlDeck';

export const metadata = {
  title: 'Control Deck · Khalil the Goat',
  robots: { index: false, follow: false }
};

// Always render fresh — no caching for the editor.
export const dynamic = 'force-dynamic';

const EditPage = async () => {
  // verifyToken throws if EDIT_SESSION_SECRET isn't set — guard against that
  // so a misconfigured env doesn't 500 the whole page.
  let isLoggedIn = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    isLoggedIn = verifyToken(token);
  } catch {
    isLoggedIn = false;
  }

  if (!isLoggedIn) return <LoginForm />;

  const content = getContent();
  // Pull videos and channel stats in parallel.
  // Both fall back gracefully when no YOUTUBE_API_KEY is set.
  const [{ videos }, channelStats] = await Promise.all([
    getRecentVideos(),
    getChannelStats()
  ]);
  return <ControlDeck initialContent={content} videos={videos} channelStats={channelStats} />;
};

export default EditPage;
