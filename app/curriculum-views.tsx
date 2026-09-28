"use client";
import { PracticeLadder } from "./practice-ladder";
import { GfgResources } from "./gfg-resources";
import { StlLessons } from "./stl-lessons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2,
  ArrowUpRight,
  BookOpen,
  Search,
  Copy,
} from "lucide-react";
import { stages, stlReference } from "@/lib/curriculum";
import { topics } from "@/lib/learning";
import { useWorkspace, api } from "./workspace-context";
import { Heading, Choice, Field, DeleteEntry, Empty, download } from "./ui-kit";
export function Curriculum() {
  const w = useWorkspace();
  const [search, setSearch] = useState("");
  const done = new Set(
    w.entries.filter((e) => e.kind === "track").map((e) => e.data.key),
  );
  const [busy, setBusy] = useState("");
  const complete = async (key: string, title: string) => {
    setBusy(key);
    try {
      const exists = w.entries.find(
        (e) => e.kind === "track" && e.data.key === key,
      );
      if (exists) await w.remove(exists.id);
      else await w.save("track", title, { key });
    } catch (e) {
      w.setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <Heading
        title="From your first line to your next level."
        description="One connected path from programming foundations to DSA, contests and interviews."
      />
      <Tabs defaultValue="path">
        <TabsList>
          <TabsTrigger value="path">Zero to hero</TabsTrigger>
          <TabsTrigger value="gfg">GeeksforGeeks</TabsTrigger>
          <TabsTrigger value="stl">STL quick reference</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts & templates</TabsTrigger>
        </TabsList>
        <TabsContent value="gfg"><GfgResources /></TabsContent>
        <TabsContent value="path">
          <section className="journey-banner">
            <div>
              <span className="eyebrow">LEARN → PRACTICE → REFLECT</span>
              <h2>Start small. Build real understanding.</h2>
              <p>
                Move at your own pace. Check off a concept only after trying it
                yourself.
              </p>
            </div>
            <div>
              <strong>
                {done.size}
                <span> / {stages.reduce((s, t) => s + t.items.length, 0)}</span>
              </strong>
              <p>concepts completed</p>
            </div>
          </section>
          <div className="curriculum-grid">
            {stages.map((s, i) => {
              const count = s.items.filter((_, j) =>
                done.has(`${s.id}-${j}`),
              ).length;
              return (
                <section className="surface stage-card" key={s.id}>
                  <div className="section-head">
                    <span className="stage-number">0{i + 1}</span>
                    <span className="tag">{s.level}</span>
                  </div>
                  <h2>{s.title}</h2>
                  <p>{s.subtitle}</p>
                  <Progress value={(100 * count) / s.items.length} />
                  <ul>
                    {s.items.map((item, j) => (
                      <li key={item}>
                        <button
                          disabled={!!busy}
                          className={done.has(`${s.id}-${j}`) ? "checked" : ""}
                          onClick={() => complete(`${s.id}-${j}`, item)}
                        >
                          <CheckCircle2 size={18} />
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <details className="lesson">
                    <summary>Practice & self-check</summary>
                    <p>{s.exercise}</p>
                    <p className="hint-box">{s.check}</p>
                  </details>
                  <a
                    className="text-link"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open practice resource <ArrowUpRight size={16} />
                  </a>
                </section>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="stl">
          <StlLessons />
          <section className="surface spaced">
            <Field label="Search STL">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Container, command or operation…"
              />
            </Field>
            <div className="reference-table">
              <table>
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Syntax</th>
                    <th>Cost</th>
                    <th>Watch out</th>
                  </tr>
                </thead>
                <tbody>
                  {stlReference
                    .filter((r) =>
                      r.join(" ").toLowerCase().includes(search.toLowerCase()),
                    )
                    .map(([name, syntax, cost, pitfall]) => (
                      <tr key={name}>
                        <th>{name}</th>
                        <td>
                          <code>{syntax}</code>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Copy ${name} syntax`}
                            onClick={() =>
                              navigator.clipboard
                                .writeText(syntax)
                                .then(() => w.setNotice("Syntax copied."))
                                .catch(() =>
                                  w.setNotice("Select and copy the syntax."),
                                )
                            }
                          >
                            <Copy size={14} />
                          </Button>
                        </td>
                        <td>{cost}</td>
                        <td>{pitfall}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <a
              className="text-link"
              href="https://en.cppreference.com/w/cpp/algorithm.html"
              target="_blank"
              rel="noreferrer"
            >
              Detailed standard-library reference ↗
            </a>
          </section>
        </TabsContent>
        <TabsContent value="shortcuts">
          <section className="surface spaced">
            <h3>Useful habits, without hiding the logic</h3>
            <div className="two-col">
              <div>
                <h3>Editor shortcuts</h3>
                <p>
                  In common desktop editors: Ctrl/Cmd+S saves, Ctrl/Cmd+F finds,
                  Ctrl/Cmd+/ toggles comments, and Ctrl/Cmd+Z undoes. Exact
                  bindings depend on your editor. The in-app editor supports
                  normal text editing; use its Format button for JavaScript.
                </p>
                <h3 className="spaced">Before every submission</h3>
                <p>
                  Check input limits, integer overflow, index boundaries, empty
                  cases, time complexity and the exact output format.
                </p>
              </div>
              <div>
                <h3>C++17 starter</h3>
                <pre className="code-block">
                  {
                    "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  int t; cin >> t;\n  while (t--) {\n    // Read, solve, print.\n  }\n  return 0;\n}"
                  }
                </pre>
                <Button
                  variant="outline"
                  onClick={() =>
                    download(
                      "starter.cpp",
                      "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);int t;cin>>t;while(t--){/* solve */}return 0;}",
                    )
                  }
                >
                  Download template
                </Button>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </>
  );
}
const sheetSources = [
  {
    name: "Apna College / Shradha Khapra",
    url: "https://dsa.apnacollege.in/studymaterial",
    description:
      "Apna College DSA sheet and study material; original publisher resources.",
  },
  {
    name: "Striver SDE",
    url: "https://takeuforward.org/home",
    description: "Choose SDE Sheet on takeUforward for interview practice.",
  },
  {
    name: "Striver 79",
    url: "https://takeuforward.org/home",
    description: "Last-minute preparation sheet from takeUforward.",
  },
  {
    name: "Blind 75",
    url: "https://takeuforward.org/home",
    description: "Interview problem collection, available under DSA Sheets.",
  },
  {
    name: "NeetCode 150",
    url: "https://neetcode.io/practice/practice/neetcode150",
    description:
      "Interview preparation collection. FAANG preparation resource, not an official company sheet.",
  },
  {
    name: "Apna College Google",
    url: "https://dsa.apnacollege.in/google",
    description:
      "Publisher-curated company practice. Not an official Google question bank.",
  },
  {
    name: "Striver A2Z",
    url: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z",
    description: "Structured DSA course and problem sheet from takeUforward.",
  },
  {
    name: "Love Babbar 450",
    url: "https://drive.google.com/file/d/1FMdN_OCfOI0iAeDlqswCiC2DZzD4nPsb/view",
    description:
      "Original DSA Cracker sheet link. Track questions you choose to work on here.",
  },
];
export function Sheets() {
  const w = useWorkspace();
  const [sheet, setSheet] = useState("Striver A2Z"),
    [title, setTitle] = useState(""),
    [url, setUrl] = useState(""),
    [topic, setTopic] = useState("Arrays"),
    [status, setStatus] = useState("To do"),
    [notes, setNotes] = useState(""),
    [filter, setFilter] = useState("All"),
    [error, setError] = useState("");
  const entries = w.entries.filter(
    (e) => e.kind === "sheet" && e.data.sheet === sheet,
  );
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:")
        throw new Error("Use an HTTPS problem link.");
      await w.save("sheet", title, { sheet, url, topic, status, notes });
      setTitle("");
      setUrl("");
      setNotes("");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <Heading
        title="Your sheets. Your pace."
        description="Follow trusted resources and keep a personal problem-by-problem revision tracker."
      />
      <div className="two-col">
        {sheetSources.map((s) => (
          <section className="surface" key={s.name}>
            <span className="pill">EXTERNAL LEARNING RESOURCE</span>
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            <a
              className="text-link"
              target="_blank"
              rel="noreferrer"
              href={s.url}
            >
              Open original sheet <ArrowUpRight size={16} />
            </a>
          </section>
        ))}
      </div>
      <section className="surface spaced">
        <div className="section-head">
          <h3>My sheet tracker</h3>
          <span className="tag">
            {entries.filter((e) => e.data.status === "Solved").length}/
            {entries.length} saved questions solved
          </span>
        </div>
        <p className="fine-print">
          Your tracker is separate from the original sheet. It does not import
          or claim to contain the full external question catalogue, or sync
          completion with its creator.
        </p>
        <form onSubmit={save}>
          <div className="filters">
            <Choice
              label="Sheet"
              value={sheet}
              options={sheetSources.map((s) => s.name)}
              onChange={setSheet}
            />
            <Field label="Problem title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={150}
              />
            </Field>
            <Field label="Original problem URL">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </Field>
            <Choice
              label="Topic"
              value={topic}
              options={topics}
              onChange={setTopic}
            />
            <Choice
              label="Status"
              value={status}
              options={["To do", "Attempted", "Solved", "Revise"]}
              onChange={setStatus}
            />
          </div>
          <Field label="Approach or mistake to revisit">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <Button type="submit">Add to tracker</Button>
        </form>
        {error && <p className="error">{error}</p>}
        <div className="section-head spaced">
          <Choice
            label="Show status"
            value={filter}
            options={["All", "To do", "Attempted", "Solved", "Revise"]}
            onChange={setFilter}
          />
          <Button
            variant="outline"
            onClick={() =>
              download(
                "my-sheet-progress.json",
                JSON.stringify(entries, null, 2),
                "application/json",
              )
            }
          >
            Export tracker
          </Button>
        </div>
        {entries.length === 0 && (
          <Empty
            title="Start with your next question"
            detail="Open a sheet, choose a problem and add its link above."
          />
        )}
        {entries
          .filter((e) => filter === "All" || e.data.status === filter)
          .map((e) => (
            <div className="list-row" key={e.id}>
              <div className="grow">
                <a
                  className="text-link"
                  href={/^https:\/\//.test(e.data.url) ? e.data.url : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {e.title} ↗
                </a>
                <small>
                  {e.data.topic} · {e.data.status}
                </small>
                <p>{e.data.notes}</p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await w.updateSheet(
                      e.id,
                      e.data.status === "Solved" ? "Revise" : "Solved",
                    );
                  } catch (err) {
                    w.setNotice((err as Error).message);
                  }
                }}
              >
                {e.data.status === "Solved" ? "Revise" : "Mark solved"}
              </Button>
              <DeleteEntry id={e.id} />
            </div>
          ))}
      </section>
    </>
  );
}
export function Competitive() {
  const w = useWorkspace();
  const [rating, setRating] = useState("800"),
    [tag, setTag] = useState("All tags"),
    [page, setPage] = useState(0),
    [result, setResult] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [customTitle, setCustomTitle] = useState(""),
    [customUrl, setCustomUrl] = useState(""),
    [topic, setTopic] = useState("Arrays");
  async function load(p = 0) {
    setBusy(true);
    setError("");
    try {
      setResult(
        await api(
          `problemset?rating=${rating}&page=${p}&tag=${encodeURIComponent(tag === "All tags" ? "" : tag)}`,
        ),
      );
      setPage(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function solved(title: string, url: string, t = topic) {
    try {
      await w.save("attempt", title, {
        problemId: url,
        minutes: w.profile.minutes,
        solved: true,
        topic: t,
      });
    } catch (e) {
      w.setNotice((e as Error).message);
    }
  }
  return (
    <>
      <Heading
        title="Build your competitive edge."
        description="Start at a comfortable level, practise deliberately, then move up."
      />
      <PracticeLadder />
      <div className="two-col">
        <section className="surface">
          <span className="pill">CODECHEF</span>
          <h2>From first submissions to contests</h2>
          <p>
            Start with the 0–500 practice course, then explore higher difficulty
            bands on the original platform.
          </p>
          <div className="actions">
            <a
              className="text-link"
              href="https://www.codechef.com/practice/basic-programming-concepts"
              target="_blank"
              rel="noreferrer"
            >
              0–500 practice ↗
            </a>
            <a
              className="text-link"
              href="https://www.codechef.com/practice"
              target="_blank"
              rel="noreferrer"
            >
              All CodeChef practice ↗
            </a>
          </div>
        </section>
        <section className="surface">
          <span className="pill">CODEFORCES</span>
          <h2>A rating-based problem ladder</h2>
          <p>
            Browse the live public catalogue below. Ratings are problem
            difficulty, not a promised user rank.
          </p>
          <a
            className="text-link"
            href="https://codeforces.com/problemset"
            target="_blank"
            rel="noreferrer"
          >
            Original problemset ↗
          </a>
        </section>
      </div>
      <section className="surface spaced">
        <div className="filters">
          <Choice
            label="Problem rating"
            value={rating}
            options={Array.from({ length: 28 }, (_, i) =>
              String(800 + i * 100),
            )}
            onChange={setRating}
          />
          <Choice
            label="Tag"
            value={tag}
            options={[
              "All tags",
              "implementation",
              "math",
              "greedy",
              "dp",
              "graphs",
              "trees",
              "strings",
              "binary search",
              "data structures",
              "number theory",
              "combinatorics",
              "geometry",
              "two pointers",
            ]}
            onChange={setTag}
          />
          <Button disabled={busy} onClick={() => load(0)}>
            {busy ? "Loading…" : "Browse live problems"}
          </Button>
        </div>
        {error && <p className="error">{error}</p>}
        {result ? (
          <>
            <p className="fine-print">
              {result.total} matching problems · fetched{" "}
              {new Date(result.updated).toLocaleString()} · Codeforces API
            </p>
            {result.problems.map((p: any) => (
              <div className="list-row" key={p.id}>
                <div className="grow">
                  <a
                    className="problem-title"
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.id} · {p.title} ↗
                  </a>
                  <small>
                    {p.rating} · {p.tags.join(", ")}
                  </small>
                </div>
                <Button
                  variant="outline"
                  disabled={w.entries.some(
                    (e) =>
                      e.kind === "attempt" &&
                      e.data.problemId === p.url &&
                      e.data.solved,
                  )}
                  onClick={() =>
                    solved(
                      p.title,
                      p.url,
                      p.tags.includes("dp")
                        ? "DP"
                        : p.tags.includes("graphs")
                          ? "Graphs"
                          : p.tags.includes("trees")
                            ? "Trees"
                            : p.tags.includes("strings")
                              ? "Strings"
                              : p.tags.includes("binary search")
                                ? "Binary Search"
                                : p.tags.includes("greedy")
                                  ? "Greedy"
                                  : "Arrays",
                    )
                  }
                >
                  Mark solved
                </Button>
              </div>
            ))}
            <div className="actions">
              <Button
                variant="outline"
                disabled={page === 0 || busy}
                onClick={() => load(page - 1)}
              >
                Previous
              </Button>
              <span>Page {page + 1}</span>
              <Button
                variant="outline"
                disabled={(page + 1) * 30 >= result.total || busy}
                onClick={() => load(page + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <Empty
            title="Choose your challenge level"
            detail="Load the catalogue to see current problem names and original submission links."
          />
        )}
      </section>
      <section className="surface spaced">
        <h3>Log a problem from any supported platform</h3>
        <p>
          Record CodeChef, Codeforces, LeetCode, AtCoder, GeeksforGeeks or
          takeUforward practice.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await solved(customTitle, customUrl);
          }}
        >
          <div className="filters">
            <Field label="Problem name">
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
                maxLength={150}
              />
            </Field>
            <Field label="Problem URL">
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                type="url"
                required
              />
            </Field>
            <Choice
              label="Topic"
              value={topic}
              options={topics}
              onChange={setTopic}
            />
            <Button type="submit">Log as solved</Button>
          </div>
        </form>
        <p className="fine-print">
          Completion is self-reported. Submissions run on the original platform.
        </p>
      </section>
    </>
  );
}
