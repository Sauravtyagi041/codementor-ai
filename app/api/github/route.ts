import { identity, failure, HttpError, privateHeaders } from "@/lib/server";
async function github(path: string): Promise<any> {
  const r = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeMentor-Practice-Studio",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok)
    throw new HttpError(
      r.status === 404 ? 404 : 502,
      r.status === 404
        ? "Public GitHub profile or repository not found."
        : "GitHub is unavailable or its public API limit was reached. Try later.",
    );
  return r.json();
}
export async function GET(request: Request) {
  try {
    await identity();
    const q = new URL(request.url).searchParams;
    const username = q.get("user") || "";
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(username))
      throw new HttpError(400, "Enter a GitHub username.");
    const repo = q.get("repo");
    if (repo) {
      if (!/^[\w.-]{1,100}$/.test(repo))
        throw new HttpError(400, "Invalid repository.");
      const base = `repos/${username}/${encodeURIComponent(repo)}`;
      const sha = q.get("sha");
      const path = q.get("path");
      if (sha) {
        if (!/^[a-f0-9]{7,40}$/.test(sha))
          throw new HttpError(400, "Invalid commit.");
        const commit = await github(`${base}/commits/${sha}`);
        return Response.json(
          {
            commit: {
              message: commit.commit.message,
              files: commit.files
                ?.slice(0, 12)
                .map((f: any) => ({
                  name: f.filename,
                  patch: f.patch?.slice(0, 8000),
                })),
            },
          },
          { headers: privateHeaders },
        );
      }
      if (path) {
        if (path.length > 250 || path.split("/").some((p) => p === ".."))
          throw new HttpError(400, "Invalid path.");
        const f = await github(
          `${base}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
        );
        if (
          Array.isArray(f) ||
          f.type !== "file" ||
          f.size > 80000 ||
          f.encoding !== "base64"
        )
          throw new HttpError(400, "Choose a text file smaller than 80 KB.");
        const bytes = Uint8Array.from(atob(f.content.replace(/\s/g, "")), (c) =>
          c.charCodeAt(0),
        );
        return Response.json(
          { name: f.name, text: new TextDecoder().decode(bytes) },
          { headers: privateHeaders },
        );
      }
      const [metadata, commits, contents] = await Promise.all([
        github(base),
        github(`${base}/commits?per_page=10`),
        github(`${base}/contents`),
      ]);
      return Response.json(
        {
          metadata: {
            name: metadata.name,
            description: metadata.description,
            language: metadata.language,
            stars: metadata.stargazers_count,
            issues: metadata.open_issues_count,
            url: metadata.html_url,
          },
          commits: commits.map((c: any) => ({
            sha: c.sha,
            message: c.commit.message,
            date: c.commit.author?.date,
            url: c.html_url,
          })),
          files: contents
            .filter((f: any) => f.type === "file")
            .map((f: any) => ({ name: f.name, path: f.path })),
        },
        { headers: privateHeaders },
      );
    }
    const [user, repos, events] = await Promise.all([
      github(`users/${username}`),
      github(`users/${username}/repos?sort=pushed&per_page=30`),
      github(`users/${username}/events/public?per_page=30`),
    ]);
    return Response.json(
      {
        user: {
          name: user.name || user.login,
          bio: user.bio,
          url: user.html_url,
          repositories: user.public_repos,
        },
        repos: repos.map((r: any) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          url: r.html_url,
          pushed: r.pushed_at,
        })),
        events: events.map((e: any) => ({
          id: e.id,
          type: e.type,
          repo: e.repo.name,
          date: e.created_at,
        })),
      },
      { headers: privateHeaders },
    );
  } catch (e) {
    return failure(e);
  }
}
