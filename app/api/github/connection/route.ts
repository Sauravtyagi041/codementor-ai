import { database } from "@/db";
import { identity, failure, privateHeaders } from "@/lib/server";
import { githubConfig } from "@/lib/github-auth";
export async function GET(request: Request) {
  try {
    const user = await identity(request);
    const connection = await database().prepare("SELECT login,connected_at AS connectedAt FROM github_connections WHERE user_id=?").bind(user.userId).first();
    return Response.json({ configured: githubConfig().ready, connection }, { headers: privateHeaders });
  } catch(e) { return failure(e); }
}
export async function DELETE(request: Request) {
  try {
    const user = await identity(request);
    await database().batch([
      database().prepare("DELETE FROM github_connections WHERE user_id=?").bind(user.userId),
      database().prepare("DELETE FROM github_oauth_states WHERE user_id=?").bind(user.userId),
    ]);
    return Response.json({ disconnected: true }, { headers: privateHeaders });
  } catch(e) { return failure(e); }
}
