"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Choice } from "./ui-kit";
import { useWorkspace } from "./workspace-context";
const starterProblems = [
  { id: "START01", title: "Number Mirror", stage: 1, topic: "Arrays" },
  { id: "FLOW001", title: "Add Two Numbers", stage: 1, topic: "Arrays" },
  { id: "FLOW006", title: "Sum of Digits", stage: 2, topic: "Arrays" },
  { id: "INTEST", title: "Enormous Input Test", stage: 2, topic: "Arrays" },
  { id: "TSORT", title: "Simple Sorting", stage: 3, topic: "Sorting" },
];
export function PracticeLadder() {
  const w = useWorkspace();
  const [stage, setStage] = useState("1"),
    [busy, setBusy] = useState("");
  const stages = [
    "Input/output & conditions",
    "Loops & arithmetic",
    "Sorting & implementation",
    "Greedy & binary search",
    "DP, graphs & contests",
  ];
  const ratings = [
    [800, 900],
    [1000, 1100],
    [1200, 1300],
    [1400, 1500, 1600],
    [1700, 1800, 1900, 2000],
  ];
  return (
    <section className="surface spaced">
      <h2>CodeChef → Codeforces: your practice ladder</h2>
      <p>
        Follow an increasing learning path. These stages are our suggested
        order; CodeChef and Codeforces rating scales are different.
      </p>
      <Choice
        label="Learning stage"
        value={stage}
        options={["1", "2", "3", "4", "5"]}
        onChange={setStage}
      />
      <h3>
        Stage {stage} · {stages[Number(stage) - 1]}
      </h3>
      <div className="two-col">
        <section>
          <h4>CodeChef</h4>
          {starterProblems
            .filter((p) => p.stage === Number(stage))
            .map((p) => {
              const url = `https://www.codechef.com/problems/${p.id}`;
              const done = w.entries.some(
                (e) =>
                  e.kind === "attempt" &&
                  e.data.problemId === url &&
                  e.data.solved,
              );
              return (
                <div className="list-row" key={p.id}>
                  <div className="grow">
                    <a
                      className="text-link"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.title} ↗
                    </a>
                    <small>
                      {p.id} · {p.topic}
                    </small>
                  </div>
                  <Button
                    disabled={done || !!busy}
                    onClick={async () => {
                      setBusy(p.id);
                      try {
                        await w.save("attempt", p.title, {
                          problemId: url,
                          topic: p.topic,
                          solved: true,
                          minutes: w.profile.minutes,
                        });
                      } catch (e) {
                        w.setNotice((e as Error).message);
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    {done ? "Solved ✓" : "Mark solved"}
                  </Button>
                </div>
              );
            })}
          <a
            className="text-link"
            href="https://www.codechef.com/practice"
            target="_blank"
            rel="noreferrer"
          >
            Browse CodeChef topic and difficulty catalogue ↗
          </a>
          {Number(stage) > 3 && (
            <p>
              Choose {stages[Number(stage) - 1].toLowerCase()} problems in the
              original catalogue. Save any chosen URL in Competitive coding
              below.
            </p>
          )}
        </section>
        <section>
          <h4>Codeforces difficulty bands</h4>
          <div className="actions">
            {ratings[Number(stage) - 1].map((r) => (
              <a
                className="upload-button"
                key={r}
                href={`https://codeforces.com/problemset?order=BY_RATING_ASC&tags=${r}-${r}`}
                target="_blank"
                rel="noreferrer"
              >
                {r} rated problems ↗
              </a>
            ))}
          </div>
          <p>
            Use the live Codeforces catalogue below to load questions in the app
            and record progress.
          </p>
        </section>
      </div>
      <p className="fine-print">
        Completion is self-reported. Submit code on the original platform to get
        a judge verdict. Move up when you can explain and solve problems
        independently.
      </p>
    </section>
  );
}
