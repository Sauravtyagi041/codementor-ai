// Run only against the loopback production worker. The deployed dispatcher owns identity headers.
import assert from "node:assert/strict";
const base = "http://127.0.0.1:8787";
const run = crypto.randomUUID();
const a = {
  "oai-authenticated-user-id": "test-a-" + run,
  "oai-authenticated-user-email": "a@example.test",
};
const b = {
  "oai-authenticated-user-id": "test-b-" + run,
  "oai-authenticated-user-email": "b@example.test",
};
async function request(
  path,
  { user = a, method = "GET", body, headers = {} } = {},
) {
  return fetch(base + path, {
    method,
    headers: {
      ...user,
      ...headers,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
}
let id, fileId;
try {
  assert.equal(
    (await request("/api/workspace", { user: {} })).status,
    401,
    "anonymous reads rejected",
  );
  assert.equal(
    (
      await request("/api/workspace", {
        method: "POST",
        body: { kind: "note", title: "Cross-origin", data: { text: "x" } },
        headers: { Origin: "https://other.example" },
      })
    ).status,
    403,
    "cross-origin writes rejected",
  );
  const created = await request("/api/workspace", {
    method: "POST",
    body: {
      kind: "note",
      title: "Isolation test",
      data: { text: "private note" },
    },
  });
  assert.equal(created.status, 200);
  id = (await created.json()).entry.id;
  let own = await (await request("/api/workspace")).json();
  assert(
    own.entries.some((e) => e.id === id),
    "owner sees saved note",
  );
  const other = await (await request("/api/workspace", { user: b })).json();
  assert(
    !other.entries.some((e) => e.id === id),
    "second user cannot read note",
  );
  await request("/api/workspace", { user: b, method: "DELETE", body: { id } });
  own = await (await request("/api/workspace")).json();
  assert(
    own.entries.some((e) => e.id === id),
    "second user cannot delete note",
  );
  assert.equal(
    (
      await request("/api/workspace", {
        method: "POST",
        body: {
          kind: "attempt",
          title: "Invalid",
          data: { problemId: "missing", minutes: 1, solved: true },
        },
      })
    ).status,
    400,
  );
  const quiz = await request("/api/quiz", {
    method: "POST",
    body: { id: "a1", answer: 2 },
  });
  assert.equal(quiz.status, 200);
  const q = await quiz.json();
  assert.equal(q.correct, true);
  await request("/api/workspace", {
    method: "DELETE",
    body: { id: q.entry.id },
  });
  const ai = await request("/api/ai", {
    method: "POST",
    body: {
      mode: "review",
      text: "return 1;",
      language: "JavaScript",
      level: "Beginner",
    },
  });
  assert.equal(ai.status, 503, "missing AI setup is explicit");
  const form = new FormData();
  form.set(
    "file",
    new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "test.png", {
      type: "image/png",
    }),
  );
  const uploaded = await fetch(base + "/api/files", {
    method: "POST",
    headers: a,
    body: form,
  });
  assert.equal(uploaded.status, 200);
  fileId = (await uploaded.json()).file.id;
  assert.equal(
    (await request("/api/files?id=" + fileId, { user: b })).status,
    404,
    "file ownership enforced",
  );
  assert.equal((await request("/api/files?id=" + fileId)).status, 200);
  console.log(
    "PASS: anonymous rejection, CSRF check, durable reads, owner isolation, validation, quiz scoring, explicit AI setup, private file access.",
  );
} finally {
  if (id) await request("/api/workspace", { method: "DELETE", body: { id } });
  if (fileId)
    await request("/api/files", { method: "DELETE", body: { id: fileId } });
}
