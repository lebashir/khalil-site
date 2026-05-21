// Announcements are stored in Vercel Edge Config — NOT in announcements.json
// in the repo anymore. The migration happened because:
//   1. Committing to GitHub triggered a Vercel deploy on every fire
//   2. Edge Config reads are <15ms globally vs ~500ms for the Contents API
//   3. Writes propagate in ~1-2s
//
// The schema (`AnnouncementsFile`) is unchanged — just the backing store.

import {
  readAnnouncementsFromEdgeConfig,
  writeAnnouncementsToEdgeConfig
} from './edge-config-store';
import type { AnnouncementsFile } from './announcement';

// Used by GET /api/announcement. Edge Config reads are already fast and
// cached by Vercel — no extra app-level cache layer needed.
export const readAnnouncementsCached = (): Promise<AnnouncementsFile> =>
  readAnnouncementsFromEdgeConfig();

// Used by POST /api/edit/announcement. Same backing store — Edge Config
// reads are consistent within a region after a write.
export const readAnnouncementsFresh = (): Promise<AnnouncementsFile> =>
  readAnnouncementsFromEdgeConfig();

export interface CommitAnnouncementsResult {
  ok: boolean;
  error?: string;
}

// Atomic-replace the whole announcements blob. The caller already
// prepended + pruned, so we just persist what they hand us.
export const commitAnnouncements = async (
  file: AnnouncementsFile,
  /** Kept in the signature for source-compatibility with the old GitHub
   *  store, but Edge Config has no concept of a commit message. */
  _message: string
): Promise<CommitAnnouncementsResult> => {
  const res = await writeAnnouncementsToEdgeConfig(file);
  return res;
};
