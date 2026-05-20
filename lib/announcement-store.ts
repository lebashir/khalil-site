// Read + write announcements.json via the GitHub Contents API. Read goes
// through Next.js fetch caching (15s) so polling visitors amortize calls;
// writes always bypass cache so the editor sees the file it just wrote.

import { commitFile, readFile } from './github';
import type { AnnouncementsFile } from './announcement';

const ANNOUNCEMENTS_PATH = 'announcements.json';
const POLL_REVALIDATE_SEC = 15;
const EMPTY: AnnouncementsFile = { items: [] };

// Used by GET /api/announcement. Cached at the fetch layer so the
// homepage poll doesn't hammer GitHub.
export const readAnnouncementsCached = async (): Promise<AnnouncementsFile> => {
  const res = await readFile<AnnouncementsFile>(ANNOUNCEMENTS_PATH, {
    revalidateSec: POLL_REVALIDATE_SEC
  });
  if (!res.ok) return EMPTY;
  if (!Array.isArray(res.data.items)) return EMPTY;
  return res.data;
};

// Used by POST /api/edit/announcement. Always fresh — we're about to
// merge in a new entry and need the latest list.
export const readAnnouncementsFresh = async (): Promise<AnnouncementsFile> => {
  const res = await readFile<AnnouncementsFile>(ANNOUNCEMENTS_PATH);
  if (!res.ok) return EMPTY;
  if (!Array.isArray(res.data.items)) return EMPTY;
  return res.data;
};

export const commitAnnouncements = (
  file: AnnouncementsFile,
  message: string
) =>
  commitFile({
    path: ANNOUNCEMENTS_PATH,
    content: file,
    message
  });
