import { getChatGPTUser } from "@/app/chatgpt-auth";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function identity(request?: Request) {
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      throw new HttpError(403, "This request came from another site.");
  }
  const user = await getChatGPTUser();
  if (!user)
    throw new HttpError(401, "Sign in to save and access your workspace.");
  return user;
}
export async function jsonBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 200000)
    throw new HttpError(413, "This request is too large.");
  const text = await request.text();
  if (text.length > 200000)
    throw new HttpError(413, "This request is too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error && typeof error === "object" && "issues" in error)
    return Response.json(
      { error: "Check the required fields and try again." },
      { status: 400 },
    );
  console.error(
    "Workspace request failed:",
    error instanceof Error ? error.message : "unknown",
  );
  return Response.json(
    {
      error:
        "The request could not be completed. Your input is still here; please retry.",
    },
    { status: 503 },
  );
}
export const privateHeaders = { "Cache-Control": "private, no-store" };
