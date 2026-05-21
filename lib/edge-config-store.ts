// Vercel Edge Config store for announcements. Reads go through the
// official SDK (sub-15ms globally via the edge cache); writes go through
// the Vercel REST API since the SDK is read-only by design.
//
// Why Edge Config and not GitHub:
//   - No deploy triggered on each fire (GitHub commits auto-redeploy)
//   - Reads are cheap (1M / month free) so we can poll fast (~3s)
//   - Writes propagate globally in ~1-2s
//
// Required env vars:
//   - EDGE_CONFIG          (auto-provisioned by Vercel when an Edge Config
//                           is linked to the project — read connection URL)
//   - VERCEL_API_KEY       (manually created at vercel.com/account/tokens —
//                           used to write items via the Vercel REST API.
//                           VERCEL_API_TOKEN is accepted as a legacy alias.)
//   - VERCEL_TEAM_ID       (only required when the Edge Config belongs to
//                           a team; omit for personal accounts)
//
// Writes use a single key — `KEY_ANNOUNCEMENTS` — that stores the whole
// `AnnouncementsFile` object. Atomic replace each time (no per-item ops
// needed).

import { get as edgeGet } from '@vercel/edge-config';
import type { AnnouncementsFile } from './announcement';

const KEY_ANNOUNCEMENTS = 'announcements';
const EMPTY: AnnouncementsFile = { items: [] };

interface EdgeConfigEnv {
  edgeConfigId: string;
  apiToken: string;
  teamId: string | null;
}

// Parses the Edge Config ID out of the connection URL. Vercel sets
// EDGE_CONFIG to something like:
//   https://edge-config.vercel.com/ecfg_abc123?token=xxx
const parseEdgeConfigId = (connectionUrl: string): string | null => {
  const match = connectionUrl.match(/(ecfg_[A-Za-z0-9]+)/);
  return match ? match[1] ?? null : null;
};

const getEnv = (): EdgeConfigEnv | { error: string } => {
  const edgeConfig = process.env.EDGE_CONFIG?.trim();
  // Accept either name — VERCEL_API_KEY is the canonical one in this
  // project, VERCEL_API_TOKEN kept as a legacy alias so older docs still
  // work.
  const apiToken =
    process.env.VERCEL_API_KEY?.trim() || process.env.VERCEL_API_TOKEN?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim() || null;
  if (!edgeConfig) {
    return {
      error:
        'EDGE_CONFIG is not set. Link an Edge Config store to this project in the Vercel dashboard.'
    };
  }
  if (!apiToken) {
    return {
      error:
        'VERCEL_API_KEY is not set. Create one at vercel.com/account/tokens and add it as an env var.'
    };
  }
  const edgeConfigId = parseEdgeConfigId(edgeConfig);
  if (!edgeConfigId) {
    return { error: 'Could not parse Edge Config ID from EDGE_CONFIG.' };
  }
  return { edgeConfigId, apiToken, teamId };
};

// Read the announcements blob from Edge Config. The SDK throws when the
// key is missing or the store is unreachable — both cases fall back to
// an empty list (fail-open, matches the GitHub-era behavior).
export const readAnnouncementsFromEdgeConfig = async (): Promise<AnnouncementsFile> => {
  if (!process.env.EDGE_CONFIG) return EMPTY;
  try {
    const value = await edgeGet<AnnouncementsFile>(KEY_ANNOUNCEMENTS);
    if (!value || typeof value !== 'object') return EMPTY;
    if (!Array.isArray(value.items)) return EMPTY;
    return value;
  } catch {
    return EMPTY;
  }
};

export interface EdgeConfigWriteResult {
  ok: boolean;
  error?: string;
}

// Upserts the whole announcements blob via the Vercel REST API. Atomic
// replace — no need to merge with what's already there because the editor
// already pruned + prepended before calling us.
export const writeAnnouncementsToEdgeConfig = async (
  file: AnnouncementsFile
): Promise<EdgeConfigWriteResult> => {
  const env = getEnv();
  if ('error' in env) return { ok: false, error: env.error };

  const params = new URLSearchParams();
  if (env.teamId) params.set('teamId', env.teamId);
  const qs = params.toString();
  const url = `https://api.vercel.com/v1/edge-config/${env.edgeConfigId}/items${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${env.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: KEY_ANNOUNCEMENTS,
            value: file
          }
        ]
      }),
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        error: `Edge Config write failed (${res.status}): ${text.slice(0, 200)}`
      };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: `Edge Config write failed: ${message}` };
  }
};
