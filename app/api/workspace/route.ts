import { database } from "@/db";
import {
  identity,
  jsonBody,
  failure,
  privateHeaders,
  HttpError,
} from "@/lib/server";
import { defaultProfile, topics, problems, quizBank } from "@/lib/learning";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { pushSolution } from "@/lib/github-sync";
const profileSchema = z.object({
  timezoneMode: z.enum(["automatic", "manual"]).optional(),
  name: z.string().trim().min(1).max(80),
  branch: z.string().trim().max(100).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  dailyGoal: z.number().int().min(1).max(20),
  minutes: z.number().int().min(5).max(480),
  timezone: z
    .string()
    .max(80)
    .refine((v) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: v });
        return true;
      } catch {
        return false;
      }
    }),
  github: z
    .string()
    .max(39)
    .regex(/^[\w-]*$/),
  company: z.string().trim().min(1).max(100),
  companies: z.array(z.string().trim().min(1).max(100)).max(100).optional(),
  skills: z.string().max(2000),
  bio: z.string().max(5000),
  reminder: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});
export async function GET() {
  try {
    const user = await identity();
    const db = database();
    const [records, profile, files] = await Promise.all([
      db
        .prepare(
          "SELECT id,kind,title,data,created FROM records WHERE user_id=? ORDER BY created DESC LIMIT 2000",
        )
        .bind(user.userId)
        .all(),
      db
        .prepare("SELECT data FROM profiles WHERE user_id=?")
        .bind(user.userId)
        .first<{ data: string }>(),
      db
        .prepare(
          "SELECT id,name,mime,size,created FROM files WHERE user_id=? ORDER BY created DESC",
        )
        .bind(user.userId)
        .all(),
    ]);
    const runtime = env as unknown as Record<string, string>;
    return Response.json(
      {
        user: { name: user.fullName || "Your workspace" },
        hasProfile: Boolean(profile),
        entries: records.results.map((r) => ({
          ...r,
          data: JSON.parse(r.data as string),
        })),
        profile: profile
          ? { ...defaultProfile, ...JSON.parse(profile.data) }
          : defaultProfile,
        files: files.results,
        aiReady: Boolean(
          runtime.CLOUDFLARE_AI_TOKEN &&
          !runtime.CLOUDFLARE_AI_TOKEN.includes("PASTE_") && /^[a-f0-9]{32}$/i.test(runtime.CLOUDFLARE_ACCOUNT_ID || ''),
        ),
      },
      { headers: privateHeaders },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await identity(request);
    const body = await jsonBody(request);
    const db = database();
    if (body.action === "profile") {
      const profile = profileSchema.parse(body.profile);
      await db
        .prepare(
          "INSERT INTO profiles(user_id,data) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data",
        )
        .bind(user.userId, JSON.stringify(profile))
        .run();
      return Response.json({ ok: true });
    }
    const base = z
      .object({
        kind: z.enum([
          "attempt",
          "note",
          "snippet",
          "project",
          "certificate",
          "contest",
          "interview",
          "chat",
          "revision",
          "track",
          "sheet",
        ]),
        title: z.string().trim().min(1).max(150),
        data: z.record(z.unknown()),
      })
      .parse(body);
    let data = base.data;
    if (base.kind === "attempt") {
      const a = z
        .object({
          problemId: z.string().min(1).max(600),
          minutes: z.number().min(0).max(480),
          solved: z.boolean(),
          topic: z.string().optional(),
        })
        .parse(data);
      const problem = problems.find((p) => p.id === a.problemId);
      if (!problem) {
        let url: URL;
        try {
          url = new URL(a.problemId);
        } catch {
          throw new HttpError(
            400,
            "Choose a problem or enter its original URL.",
          );
        }
        if (
          url.protocol !== "https:" ||
          ![
            "codeforces.com",
            "www.codechef.com",
            "codechef.com",
            "leetcode.com",
            "www.geeksforgeeks.org",
            "takeuforward.org",
            "atcoder.jp",
          ].includes(url.hostname)
        )
          throw new HttpError(
            400,
            "Use a problem URL from a supported practice platform.",
          );
        if (!a.topic || !topics.includes(a.topic))
          throw new HttpError(400, "Choose a valid topic.");
      }
      data = {
        ...a,
        topic: problem?.topic || a.topic,
        source: "self-reported",
      };
    }
    if (JSON.stringify(data).length > 80000)
      throw new HttpError(413, "Keep saved entries under 80,000 characters.");
    const id = crypto.randomUUID(),
      created = new Date().toISOString();
    await db
      .prepare(
        "INSERT INTO records(id,user_id,kind,title,data,created) VALUES(?,?,?,?,?,?)",
      )
      .bind(
        id,
        user.userId,
        base.kind,
        base.title,
        JSON.stringify(data),
        created,
      )
      .run();
    let githubSync;
    if(base.kind === "snippet") {
      try { githubSync=await pushSolution(user.userId,id); }
      catch { githubSync={status:"failed"}; }
    }
    return Response.json({ entry: { id, kind: base.kind, title: base.title, data, created }, githubSync });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    const user = await identity(request);
    const { id } = z
      .object({ id: z.string().uuid() })
      .parse(await jsonBody(request));
    await database()
      .prepare("DELETE FROM records WHERE id=? AND user_id=?")
      .bind(id, user.userId)
      .run();
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(request: Request) {
  try {
    const user = await identity(request);
    const { id, status } = z
      .object({
        id: z.string().uuid(),
        status: z.enum(["To do", "Attempted", "Solved", "Revise"]),
      })
      .parse(await jsonBody(request));
    const db = database();
    const record = await db
      .prepare(
        "SELECT id,kind,title,data,created FROM records WHERE id=? AND user_id=? AND kind=?",
      )
      .bind(id, user.userId, "sheet")
      .first<{
        id: string;
        kind: string;
        title: string;
        data: string;
        created: string;
      }>();
    if (!record) throw new HttpError(404, "Sheet entry not found.");
    const data = { ...JSON.parse(record.data), status };
    await db
      .prepare("UPDATE records SET data=? WHERE id=? AND user_id=?")
      .bind(JSON.stringify(data), id, user.userId)
      .run();
    return Response.json({ entry: { ...record, data } });
  } catch (e) {
    return failure(e);
  }
}
