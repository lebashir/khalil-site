// GitHub Contents API helpers. Powers content.json saves from /edit and
// announcements.json fires from the message launcher.
//
//   GET  /repos/{owner}/{repo}/contents/{path}?ref={branch}   → current SHA + base64 content
//   PUT  /repos/{owner}/{repo}/contents/{path}               → write with sha + base64 content

interface GithubEnv {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

const getEnv = (): GithubEnv | { error: string } => {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || 'main';
  if (!token || !owner || !repo) {
    return { error: 'GitHub commit settings are not configured. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME.' };
  }
  return { token, owner, repo, branch };
};

const githubHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
});

const baseUrl = (env: GithubEnv, path: string): string =>
  `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${path}`;

export interface CommitResult {
  ok: boolean;
  error?: string;
  commitSha?: string;
}

interface CommitFileArgs {
  path: string;
  content: unknown;
  message: string;
}

// Generic file commit. Reads current SHA, PUTs JSON-stringified content.
// Used by both commitContent (content.json) and the announcement store.
export const commitFile = async ({ path, content, message }: CommitFileArgs): Promise<CommitResult> => {
  const env = getEnv();
  if ('error' in env) return { ok: false, error: env.error };

  const headers = githubHeaders(env.token);
  const base = baseUrl(env, path);

  // 1. Look up the current SHA. 404 is fine — means the file doesn't exist yet.
  const getRes = await fetch(`${base}?ref=${env.branch}`, { headers, cache: 'no-store' });
  if (!getRes.ok && getRes.status !== 404) {
    return { ok: false, error: `Couldn't read ${path} from GitHub (${getRes.status}).` };
  }
  const sha = getRes.ok
    ? ((await getRes.json()) as { sha?: string }).sha
    : undefined;

  // 2. PUT the new content.
  const body = JSON.stringify(content, null, 2) + '\n';
  const base64 = Buffer.from(body, 'utf8').toString('base64');

  const putRes = await fetch(base, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: base64,
      branch: env.branch,
      ...(sha ? { sha } : {})
    }),
    cache: 'no-store'
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    return { ok: false, error: `GitHub rejected the save (${putRes.status}): ${text.slice(0, 200)}` };
  }
  const out = (await putRes.json()) as { commit?: { sha?: string } };
  return { ok: true, commitSha: out.commit?.sha };
};

// Backward-compatible wrapper for content.json saves.
export const commitContent = (newContent: unknown, message: string): Promise<CommitResult> =>
  commitFile({ path: 'content.json', content: newContent, message });

interface ReadFileOpts {
  /** When set, the underlying GitHub fetch is cached at the edge for this
   *  many seconds. Use 0 (or omit) for no-store; use a small number (15s)
   *  for the announcements poll to amortize calls across visitors. */
  revalidateSec?: number;
}

export type ReadFileResult<T> =
  | { ok: true; data: T; sha: string }
  | { ok: false; error: string; status: number };

// Generic JSON file read. Decodes base64 + parses JSON. Missing files (404)
// come back as ok:false so callers can fall back to defaults.
export const readFile = async <T>(path: string, opts: ReadFileOpts = {}): Promise<ReadFileResult<T>> => {
  const env = getEnv();
  if ('error' in env) return { ok: false, error: env.error, status: 0 };

  const headers = githubHeaders(env.token);
  const base = baseUrl(env, path);

  const fetchOpts: RequestInit & { next?: { revalidate: number } } =
    opts.revalidateSec !== undefined
      ? { headers, next: { revalidate: opts.revalidateSec } }
      : { headers, cache: 'no-store' };

  const res = await fetch(`${base}?ref=${env.branch}`, fetchOpts);
  if (!res.ok) {
    return { ok: false, error: `Read ${path} failed (${res.status}).`, status: res.status };
  }
  const json = (await res.json()) as { content?: string; encoding?: string; sha?: string };
  if (!json.content || json.encoding !== 'base64' || !json.sha) {
    return { ok: false, error: `Malformed Contents API response for ${path}.`, status: 200 };
  }
  const decoded = Buffer.from(json.content, 'base64').toString('utf8');
  try {
    return { ok: true, data: JSON.parse(decoded) as T, sha: json.sha };
  } catch {
    return { ok: false, error: `Invalid JSON in ${path}.`, status: 200 };
  }
};
