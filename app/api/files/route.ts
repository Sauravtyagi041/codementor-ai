import { env } from "cloudflare:workers";
import { database } from "@/db";
import {
  identity,
  failure,
  HttpError,
  privateHeaders,
  jsonBody,
} from "@/lib/server";
const allowed = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "audio/webm",
  "video/webm",
  "audio/mp4",
  "video/mp4",
  "audio/ogg",
]);
export async function POST(request: Request) {
  try {
    const user = await identity(request);
    if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024)
      throw new HttpError(413, "The file limit is 10 MB.");
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 10 * 1024 * 1024
    )
      throw new HttpError(400, "Choose a nonempty file up to 10 MB.");
    const mime = file.type.split(";")[0];
    if (!allowed.has(mime))
      throw new HttpError(400, "Use PNG, JPG, WebP, PDF, WebM, MP4 or Ogg.");
    if (!env.BUCKET) throw new HttpError(503, "File storage is unavailable.");
    const id = crypto.randomUUID();
    const name = file.name.replace(/[\r\n"\\/]/g, "_").slice(0, 120);
    await env.BUCKET.put(id, file.stream(), {
      httpMetadata: { contentType: mime },
    });
    try {
      await database()
        .prepare(
          "INSERT INTO files(id,user_id,name,mime,size,created) VALUES(?,?,?,?,?,?)",
        )
        .bind(id, user.userId, name, mime, file.size, new Date().toISOString())
        .run();
    } catch (e) {
      await env.BUCKET.delete(id);
      throw e;
    }
    return Response.json({ file: { id, name, mime, size: file.size } });
  } catch (e) {
    return failure(e);
  }
}
export async function GET(request: Request) {
  try {
    const user = await identity();
    const id = new URL(request.url).searchParams.get("id") || "";
    const meta = await database()
      .prepare("SELECT name,mime FROM files WHERE id=? AND user_id=?")
      .bind(id, user.userId)
      .first<{ name: string; mime: string }>();
    if (!meta) throw new HttpError(404, "File not found.");
    const file = await env.BUCKET?.get(id);
    if (!file) throw new HttpError(404, "File is unavailable.");
    return new Response(file.body, {
      headers: {
        ...privateHeaders,
        "Content-Type": meta.mime,
        "Content-Disposition": `attachment; filename="${meta.name}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    const user = await identity(request);
    const { id } = await jsonBody(request);
    if (typeof id !== "string") throw new HttpError(400, "File ID required.");
    const own = await database()
      .prepare("SELECT id FROM files WHERE id=? AND user_id=?")
      .bind(id, user.userId)
      .first();
    if (!own) throw new HttpError(404, "File not found.");
    if (!env.BUCKET) throw new HttpError(503, "File storage is unavailable.");
    await env.BUCKET.delete(id);
    await database()
      .prepare("DELETE FROM files WHERE id=? AND user_id=?")
      .bind(id, user.userId)
      .run();
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
