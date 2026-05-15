// Commit content.json back to GitHub from /edit. Uses the Contents API:
//   GET  /repos/{owner}/{repo}/contents/{path}?ref={branch}   → current SHA
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

const CONTENT_PATH = 'content.json';

export interface CommitResult {
  ok: boolean;
  error?: string;
  commitSha?: string;
}

export const commitContent = async (newContent: unknown, message: string): Promise<CommitResult> => {
  const env = getEnv();
  if ('error' in env) return { ok: false, error: env.error };

  const headers = {
    Authorization: `Bearer ${env.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  const base = `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${CONTENT_PATH}`;

  // 1. Look up the current SHA.
  const getRes = await fetch(`${base}?ref=${env.branch}`, { headers, cache: 'no-store' });
  if (!getRes.ok && getRes.status !== 404) {
    return { ok: false, error: `Couldn't read content.json from GitHub (${getRes.status}).` };
  }
  const sha = getRes.ok
    ? ((await getRes.json()) as { sha?: string }).sha
    : undefined;

  // 2. PUT the new content.
  const body = JSON.stringify(newContent, null, 2) + '\n';
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
