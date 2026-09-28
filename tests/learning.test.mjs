import test from "node:test";
import assert from "node:assert/strict";
import {
  statistics,
  defaultProfile,
  dayKey,
  similarity,
  staticReview,
} from "../lib/learning.ts";
const attempt = (id, created, data = {}) => ({
  id,
  kind: "attempt",
  title: "Practice",
  created,
  data: { problemId: id, topic: "Arrays", solved: true, minutes: 20, ...data },
});
test("streak crosses month boundaries and counts unique solved problems", () => {
  const entries = [
    attempt("a", "2026-03-01T10:00:00Z"),
    attempt("b", "2026-02-28T10:00:00Z"),
    attempt("a", "2026-02-27T10:00:00Z"),
  ];
  const result = statistics(
    entries,
    defaultProfile,
    new Date("2026-03-01T12:00:00Z"),
  );
  assert.equal(result.streak, 3);
  assert.equal(result.longest, 3);
  assert.equal(result.solved, 2);
});
test("streak remains valid before today is completed, then expires", () => {
  const entries = [attempt("a", "2026-03-01T10:00:00Z")];
  assert.equal(
    statistics(entries, defaultProfile, new Date("2026-03-02T10:00:00Z"))
      .streak,
    1,
  );
  assert.equal(
    statistics(entries, defaultProfile, new Date("2026-03-03T10:00:00Z"))
      .streak,
    0,
  );
});
test("uses selected timezone at midnight", () => {
  assert.equal(dayKey("2026-03-01T20:00:00Z", "Asia/Kolkata"), "2026-03-02");
  assert.equal(dayKey("2026-03-01T20:00:00Z", "UTC"), "2026-03-01");
});
test("quiz scores do not become solved problems", () => {
  const e = attempt("q", "2026-03-01T10:00:00Z", {
    source: "quiz",
    solved: false,
    problemId: undefined,
    quizId: "a1",
    correct: true,
  });
  const result = statistics(
    [e, e],
    defaultProfile,
    new Date("2026-03-01T12:00:00Z"),
  );
  assert.equal(result.solved, 0);
  assert.equal(result.byTopic[0].accuracy, 100);
  assert.equal(result.byTopic[0].coverage, 33);
});
test("empty data has no invented progress", () => {
  const r = statistics([], defaultProfile);
  assert.equal(r.streak, 0);
  assert.equal(r.coverage, 0);
  assert.equal(r.byTopic[0].accuracy, null);
});
test("similarity handles empty inputs and identical tokens", () => {
  assert.equal(similarity("", ""), 0);
  assert.equal(similarity("return a + 1;", "return a + 2;"), 100);
});
test("static review is labelled and identifies numeric sort pitfall", () => {
  const r = staticReview("const a=[3,20];a.sort();", "JavaScript");
  assert.match(r, /comparator/);
  assert.match(r, /not AI or execution/);
});
