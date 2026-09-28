"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./workspace-context";
const resources = [
  { title: "Start DSA from zero", topic: "Arrays", level: "Beginner", url: "https://www.geeksforgeeks.org/dsa/complete-roadmap-to-learn-dsa-from-scratch/", note: "Start with variables, conditions, loops and functions in one language. Then implement small data structures before tackling harder patterns.", exercise: "Write a function that finds the largest number. Trace it on negative numbers and an empty array." },
  { title: "DSA topic guide", topic: "Arrays", level: "Beginner", url: "https://www.geeksforgeeks.org/dsa/introduction-to-dsa/", note: "Separate the way data is stored from the steps used to process it. Choose a structure by the operations your problem needs.", exercise: "Compare searching an unsorted array with searching sorted data. Explain the tradeoff of sorting first." },
  { title: "Time and space complexity", topic: "Binary Search", level: "Beginner", url: "https://www.geeksforgeeks.org/dsa/time-complexity-and-space-complexity/", note: "Count how work grows with input size, not seconds on your laptop. A full scan is linear; repeatedly halving a search range takes logarithmically many steps. Include recursion stack memory in auxiliary space.", exercise: "Compare a single scan with two nested full scans for n=10, 100 and 1000. Explain why sequential loops do not multiply." },
  { title: "C++ STL explained", topic: "STL", level: "Beginner", url: "https://www.geeksforgeeks.org/cpp/the-c-standard-template-library-stl/", note: "Containers hold values, iterators identify positions and algorithms operate on ranges. Know whether an operation changes element positions or invalidates iterators.", exercise: "Sort a vector, remove repeated values and search for a target. Explain why lower_bound needs a sorted range." },
  { title: "Beginner DSA problem sheet", topic: "Arrays", level: "Beginner", url: "https://www.geeksforgeeks.org/dsa/most-asked-dsa-interview-problems-for-beginners/", note: "Use this external sheet after learning language basics. Attempt a problem first, read hints next, and write your own explanation after solving.", exercise: "Pick one easy problem. Record a brute-force approach, an edge case and the reason for your final complexity." },
  { title: "GfG 160: structured practice", topic: "Arrays", level: "Beginner to advanced", url: "https://www.geeksforgeeks.org/courses/gfg-160-series", note: "A structured external practice program with articles and video explanations. Open the official program for its current problem sequence and access requirements.", exercise: "After today's problem, close the editorial and rebuild the solution from memory. Record the pattern you learned." },
  { title: "Problem of the Day", topic: "DP", level: "Mixed", url: "https://www.geeksforgeeks.org/problem-of-the-day", note: "Open the official daily problem and check its difficulty. If it is beyond your current level, revise its prerequisites before attempting it.", exercise: "Write down the constraints, one small example and the part where you got stuck. Use that to ask the mentor a precise question." },
];
export function GfgResources() {
  const w = useWorkspace();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  return <section className="surface spaced">
    <h2>Learn with GeeksforGeeks</h2>
    <p>Beginner guides, explanations and practice. These short companion notes are written for this app; full articles and editorials open on GeeksforGeeks.</p>
    <input aria-label="Search GeeksforGeeks resources" placeholder="Search DSA, STL, complexity or practice" value={search} onChange={e => setSearch(e.target.value)} />
    <div className="curriculum-grid">
      {resources.filter(r => `${r.title} ${r.topic} ${r.note}`.toLowerCase().includes(search.toLowerCase())).map(r => {
        const saved = w.entries.some(e => e.kind === "note" && e.data.source === r.url);
        return <article className="surface" key={r.url}>
          <span className="tag">{r.level}</span><h3>{r.title}</h3><p>{r.note}</p>
          <details><summary>Try it yourself</summary><p>{r.exercise}</p></details>
          <div className="actions"><a className="text-link" href={r.url} target="_blank" rel="noreferrer">Read on GeeksforGeeks ↗</a>
          <Button type="button" variant="outline" disabled={saved || busy === r.url} onClick={async () => {setBusy(r.url);try{await w.save("note", r.title, {topic:r.topic, source:r.url, text:`${r.note}\n\nTry it yourself: ${r.exercise}\n\nOfficial resource: ${r.url}`});}catch(e){w.setNotice((e as Error).message);}finally{setBusy("");}}}>{saved ? "Saved to notes" : busy === r.url ? "Saving…" : "Save companion note"}</Button></div>
        </article>;
      })}
    </div>
    <p>Practice submissions and editorial access happen on GeeksforGeeks. Saving a note here does not mark a problem solved there.</p>
  </section>;
}
