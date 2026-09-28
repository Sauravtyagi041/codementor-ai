import { database } from "@/db";
import {
  identity,
  jsonBody,
  failure,
  HttpError,
  privateHeaders,
} from "@/lib/server";
import { problems } from "@/lib/learning";
import { z } from "zod";
export async function GET() {
  try {
    const user = await identity();
    const db = database();
    const list = await db
      .prepare(
        "SELECT c.* FROM challenges c JOIN members m ON m.challenge_id=c.id WHERE m.user_id=? ORDER BY c.created DESC LIMIT 100",
      )
      .bind(user.userId)
      .all();
    const challenges = await Promise.all(
      list.results.map(async (c) => ({
        ...c,
        members: (
          await db
            .prepare(
              "SELECT name,completed,user_id=? AS is_me FROM members WHERE challenge_id=?",
            )
            .bind(user.userId, c.id)
            .all()
        ).results,
      })),
    );
    return Response.json({ challenges }, { headers: privateHeaders });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await identity(request);
    const b = await jsonBody(request);
    const db = database();
    if (b.action === "create") {
      const data = z
        .object({
          title: z.string().trim().min(1).max(120),
          problemId: z.string().refine((v) => problems.some((p) => p.id === v)),
          deadline: z
            .string()
            .datetime()
            .refine((v) => new Date(v) > new Date()),
          name: z.string().trim().min(1).max(60),
        })
        .parse(b);
      const id = crypto.randomUUID();
      await db.batch([
        db
          .prepare(
            "INSERT INTO challenges(id,owner_id,title,problem_id,deadline,created) VALUES(?,?,?,?,?,?)",
          )
          .bind(
            id,
            user.userId,
            data.title,
            data.problemId,
            data.deadline,
            new Date().toISOString(),
          ),
        db
          .prepare(
            "INSERT INTO members(challenge_id,user_id,name,completed) VALUES(?,?,?,0)",
          )
          .bind(id, user.userId, data.name),
      ]);
      return Response.json({ id });
    }
    const { id } = z.object({ id: z.string().uuid() }).parse(b);
    const challenge = await db
      .prepare("SELECT deadline FROM challenges WHERE id=?")
      .bind(id)
      .first<{ deadline: string }>();
    if (!challenge)
      throw new HttpError(404, "Challenge not found. Check the invite code.");
    if (new Date(challenge.deadline) < new Date())
      throw new HttpError(400, "This challenge has ended.");
    if (b.action === "join") {
      const name = z.string().trim().min(1).max(60).parse(b.name);
      await db
        .prepare(
          "INSERT INTO members(challenge_id,user_id,name,completed) VALUES(?,?,?,0) ON CONFLICT(challenge_id,user_id) DO NOTHING",
        )
        .bind(id, user.userId, name)
        .run();
    } else if (b.action === "complete") {
      await db
        .prepare(
          "UPDATE members SET completed=1 WHERE challenge_id=? AND user_id=?",
        )
        .bind(id, user.userId)
        .run();
    } else throw new HttpError(400, "Unknown challenge action.");
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
