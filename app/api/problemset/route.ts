import { identity, failure, HttpError } from "@/lib/server";
export async function GET(request: Request) {
  try {
    await identity();
    const q = new URL(request.url).searchParams;
    const rating = Number(q.get("rating") || 800),
      page = Number(q.get("page") || 0),
      tag = q.get("tag") || "";
    if (
      !Number.isInteger(rating) ||
      rating < 800 ||
      rating > 3500 ||
      !Number.isInteger(page) ||
      page < 0 ||
      page > 500 ||
      tag.length > 40
    )
      throw new HttpError(400, "Invalid problem filter.");
    const r = await fetch("https://codeforces.com/api/problemset.problems", {
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok)
      throw new HttpError(
        502,
        "Codeforces problem library is temporarily unavailable. Use the original problemset link below.",
      );
    const d = (await r.json()) as {
      status: string;
      result: { problems: any[] };
    };
    if (d.status !== "OK")
      throw new HttpError(502, "Codeforces could not return problems.");
    const selected = d.result.problems.filter(
      (p) => p.rating === rating && (!tag || p.tags.includes(tag)),
    );
    return Response.json({
      total: selected.length,
      problems: selected
        .slice(page * 30, page * 30 + 30)
        .map((p) => ({
          id: `${p.contestId}${p.index}`,
          title: p.name,
          rating: p.rating,
          tags: p.tags,
          url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
        })),
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return failure(e);
  }
}
