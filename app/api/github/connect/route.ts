import { database } from "@/db";
import { identity, failure, privateHeaders } from "@/lib/server";
import { configured, base64url } from "@/lib/github-auth";
export async function POST(request: Request) {
  try {
    const user = await identity(request);
    const config = configured();
    const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
    await database().batch([
      database().prepare("DELETE FROM github_oauth_states WHERE user_id=? OR expires<?").bind(user.userId, Date.now()),
      database().prepare("INSERT INTO github_oauth_states(state,user_id,verifier,expires) VALUES(?,?,?,?)").bind(state, user.userId, verifier, Date.now() + 600000),
    ]);
    const url = new URL("https://github.com/login/oauth/authorize");
    url.search = new URLSearchParams({ client_id: config.id, redirect_uri: config.callback, state, scope: "read:user public_repo", code_challenge: challenge, code_challenge_method: "S256" }).toString();
    return Response.json({ url: url.toString() }, { headers: privateHeaders });
  } catch (e) { return failure(e); }
}
