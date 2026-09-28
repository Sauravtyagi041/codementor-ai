import { database } from "@/db";
import { identity, HttpError } from "@/lib/server";
import { configured, encryptToken } from "@/lib/github-auth";
export async function GET(request: Request) {
  let result = "failed";
  let stage = "session";
  try {
    const user = await identity(request);
    const c = configured();
    stage = "state";
    const q = new URL(request.url).searchParams;
    const state = q.get("state") || "";
    if (!/^[\w-]{43}$/.test(state)) throw new HttpError(400, "Invalid state");
    const pending = await database().prepare("DELETE FROM github_oauth_states WHERE state=? AND user_id=? AND expires>? RETURNING verifier").bind(state, user.userId, Date.now()).first<{verifier: string}>();
    if (!pending) throw new HttpError(400, "Expired state");
    if (q.has("error")) result = "cancelled";
    else {
      const code = q.get("code");
      if (!code || code.length > 1024) throw new HttpError(400, "Missing code");
      stage = "network";
      const exchange = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "CodeMentor" },
        body: JSON.stringify({ client_id: c.id, client_secret: c.secret, redirect_uri: c.callback, code, code_verifier: pending.verifier }), signal: AbortSignal.timeout(15000),
      });
      const token = await exchange.json() as {access_token?: string;error?:string};
      if (!exchange.ok || !token.access_token) {
        stage = ["incorrect_client_credentials","redirect_uri_mismatch","bad_verification_code"].includes(token.error || "") ? token.error! : "exchange";
        throw new HttpError(502, "Exchange failed");
      }
      stage = "profile";
      const profile = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/vnd.github+json", "User-Agent": "CodeMentor" }, signal: AbortSignal.timeout(15000) });
      const github = await profile.json() as {login?: string; id?: number};
      if (!profile.ok || !github.login || !github.id) throw new HttpError(502, "Profile unavailable");
      stage = "storage";
      await database().prepare("INSERT INTO github_connections(user_id,login,github_id,token,connected_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET login=excluded.login,github_id=excluded.github_id,token=excluded.token,connected_at=excluded.connected_at,repository='',branch='',auto_push=0").bind(user.userId, github.login, String(github.id), await encryptToken(token.access_token, user.userId), new Date().toISOString()).run();
      result = "connected";
    }
  } catch { result = `failed_${stage}`; /* Only an allowlisted stage is exposed, never credentials. */ }
  return new Response(null, { status: 303, headers: { Location: `/?github=${result}#Settings`, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
