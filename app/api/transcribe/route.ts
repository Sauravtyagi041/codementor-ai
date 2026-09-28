import { env } from "cloudflare:workers";
import { database } from "@/db";
import { identity, failure, HttpError } from "@/lib/server";
export async function POST(request: Request) {
  try {
    const user = await identity(request);
    const runtime = env as unknown as Record<string, string>;
    if (runtime.AI_PROVIDER !== 'openai') throw new HttpError(503, 'Recorded-file transcription is not enabled with this provider. Type your transcript or use browser voice input.');
    if (!runtime.OPENAI_API_KEY)
      throw new HttpError(
        503,
        "AI transcription needs the server AI connection. You can still type your transcript.",
      );
    if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024)
      throw new HttpError(413, "Recording must be under 10 MB.");
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > 10 * 1024 * 1024 ||
      ![
        "audio/webm",
        "video/webm",
        "audio/mp4",
        "video/mp4",
        "audio/ogg",
      ].includes(file.type.split(";")[0])
    )
      throw new HttpError(
        400,
        "Upload a WebM, MP4 or Ogg recording under 10 MB.",
      );
    const quota = await database()
      .prepare(
        "INSERT INTO ai_usage(user_id,day,count) VALUES(?,?,1) ON CONFLICT(user_id,day) DO UPDATE SET count=count+1 WHERE count<40 RETURNING count",
      )
      .bind(user.userId, new Date().toISOString().slice(0, 10))
      .first();
    if (!quota) throw new HttpError(429, "Daily AI request limit reached.");
    const upstream = new FormData();
    upstream.set("file", file);
    upstream.set("model", runtime.OPENAI_TRANSCRIPTION_MODEL || "whisper-1");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${runtime.OPENAI_API_KEY}` },
      body: upstream,
      signal: AbortSignal.timeout(60000),
    });
    if (!r.ok)
      throw new HttpError(
        502,
        "Transcription could not complete. Check the server AI setup or type your answer.",
      );
    const d = (await r.json()) as { text: string };
    return Response.json({ text: d.text });
  } catch (e) {
    return failure(e);
  }
}
