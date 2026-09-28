import { identity, failure, HttpError } from "@/lib/server";
export async function GET() {
  try {
    await identity();
    const r = await fetch("https://codeforces.com/api/contest.list?gym=false", {
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok)
      throw new HttpError(
        502,
        "Codeforces is unavailable. Your saved contests are still accessible.",
      );
    const data = (await r.json()) as { status: string; result: any[] };
    if (data.status !== "OK")
      throw new HttpError(502, "Codeforces could not return contests.");
    return Response.json({
      updated: new Date().toISOString(),
      upcoming: data.result
        .filter((c) => c.phase === "BEFORE")
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
        .slice(0, 30)
        .map((c) => ({
          id: String(c.id),
          title: c.name,
          start: new Date(c.startTimeSeconds * 1000).toISOString(),
          minutes: Math.round(c.durationSeconds / 60),
          url: `https://codeforces.com/contest/${c.id}`,
          platform: "Codeforces",
        })),
      virtual: data.result
        .filter((c) => c.phase === "FINISHED")
        .slice(0, 8)
        .map((c) => ({
          id: c.id,
          title: c.name,
          url: `https://codeforces.com/contest/${c.id}`,
        })),
    });
  } catch (e) {
    return failure(e);
  }
}
