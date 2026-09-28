import { database } from "@/db";
import { identity, jsonBody, failure, HttpError } from "@/lib/server";
import { quizBank } from "@/lib/learning";
import { z } from "zod";
export async function POST(request: Request) {
  try {
    const user = await identity(request);
    const { id, answer } = z
      .object({ id: z.string(), answer: z.number().int().min(0).max(3) })
      .parse(await jsonBody(request));
    const quiz = quizBank.find((q) => q.id === id);
    if (!quiz) throw new HttpError(404, "Quiz not found.");
    const data = {
      source: "quiz",
      quizId: id,
      topic: quiz.topic,
      correct: answer === quiz.answer,
      answer,
      minutes: 0,
    };
    const entry = {
      id: crypto.randomUUID(),
      kind: "attempt",
      title: quiz.q,
      data,
      created: new Date().toISOString(),
    };
    await database()
      .prepare(
        "INSERT INTO records(id,user_id,kind,title,data,created) VALUES(?,?,?,?,?,?)",
      )
      .bind(
        entry.id,
        user.userId,
        entry.kind,
        entry.title,
        JSON.stringify(data),
        entry.created,
      )
      .run();
    return Response.json({
      correct: data.correct,
      answer: quiz.answer,
      why: quiz.why,
      entry,
    });
  } catch (e) {
    return failure(e);
  }
}
