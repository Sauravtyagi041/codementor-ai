"use client";
import { branches } from "@/lib/branches";
import { CompanyPicker } from "./company-picker";
import { TimezonePicker } from "./timezone-picker";
import { GfgResources } from "./gfg-resources";
import { GitHubConnect } from "./github-connect";
import { SkillPicker } from "./skill-picker";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarDays,
  RefreshCw,
  GitBranch,
  Upload,
  ArrowUpRight,
} from "lucide-react";
import { useWorkspace, api } from "./workspace-context";
import {
  Heading,
  Field,
  Choice,
  Empty,
  AIBox,
  Result,
  DeleteEntry,
  download,
} from "./ui-kit";
import {
  lessons,
  topics,
  problems,
  statistics,
  companyTopics,
} from "@/lib/learning";
function safeUrl(value: unknown) {
  try {
    const u = new URL(String(value));
    return u.protocol === "https:" ? u.href : "#";
  } catch {
    return "#";
  }
}
export function eventCalendar(title: string, start: string, minutes = 60) {
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z/, "Z");
  const escaped = title
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
  download(
    "codementor-event.ics",
    `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CodeMentor//Practice//EN\r\nBEGIN:VEVENT\r\nUID:${crypto.randomUUID()}@codementor\r\nDTSTAMP:${stamp(new Date())}\r\nDTSTART:${stamp(new Date(start))}\r\nDTEND:${stamp(new Date(new Date(start).getTime() + minutes * 60000))}\r\nSUMMARY:${escaped}\r\nBEGIN:VALARM\r\nTRIGGER:-PT15M\r\nACTION:DISPLAY\r\nDESCRIPTION:Practice reminder\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`,
    "text/calendar",
  );
}
export function Contests() {
  const w = useWorkspace();
  const [live, setLive] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [title, setTitle] = useState(""),
    [platform, setPlatform] = useState("Codeforces"),
    [start, setStart] = useState(""),
    [url, setUrl] = useState(""),
    [rating, setRating] = useState(""),
    [rank, setRank] = useState("");
  async function load() {
    setBusy(true);
    setError("");
    try {
      setLive(await api("contests"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await w.save("contest", title, {
        platform,
        start: new Date(start).toISOString(),
        url: safeUrl(url),
        rating,
        rank,
        minutes: 120,
      });
      setTitle("");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <Heading
        title="Make room for a challenge."
        description="Upcoming contests, calendar reminders and your performance history."
      >
        <Button variant="outline" onClick={load} disabled={busy}>
          <RefreshCw />
          {busy ? "Loading…" : "Refresh Codeforces"}
        </Button>
      </Heading>
      <div className="quick-links">
        {[
          ["LeetCode", "https://leetcode.com/contest/"],
          ["Codeforces", "https://codeforces.com/contests"],
          ["CodeChef", "https://www.codechef.com/contests"],
          ["AtCoder", "https://atcoder.jp/contests/"],
          ["HackerRank", "https://www.hackerrank.com/contests"],
          ["Topcoder", "https://www.topcoder.com/challenges"],
          ["GeeksforGeeks", "https://www.geeksforgeeks.org/events"],
        ].map(([name, link]) => (
          <a
            className="platform-link"
            href={link}
            target="_blank"
            rel="noreferrer"
            key={name}
          >
            {name}
            <ArrowUpRight size={16} />
          </a>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="two-col spaced">
        <section className="surface">
          <h3>Upcoming · Codeforces live feed</h3>
          {!live ? (
            <Empty
              title="Load the latest contests"
              detail="Other platforms open their official calendars above; save an event below to track it here."
            />
          ) : live.upcoming.length ? (
            live.upcoming.map((c: any) => (
              <div className="list-row" key={c.id}>
                <div className="grow">
                  <a
                    className="text-link"
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {c.title}
                  </a>
                  <small>
                    {new Date(c.start).toLocaleString()} · {c.minutes} min
                  </small>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    w
                      .save("contest", c.title, c)
                      .catch((e) => w.setNotice(e.message))
                  }
                >
                  Save
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Calendar for ${c.title}`}
                  onClick={() => eventCalendar(c.title, c.start, c.minutes)}
                >
                  <CalendarDays />
                </Button>
              </div>
            ))
          ) : (
            <p>No upcoming contests returned.</p>
          )}
          {live && (
            <small>Fetched {new Date(live.updated).toLocaleString()}</small>
          )}
        </section>
        <section className="surface">
          <h3>Save a contest or performance</h3>
          <form onSubmit={save}>
            <Field label="Contest name">
              <input
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <div className="filters">
              <Choice
                label="Platform"
                value={platform}
                options={["Codeforces", "CodeChef", "LeetCode", "AtCoder", "GeeksforGeeks"]}
                onChange={setPlatform}
              />
              <Field label="Start · your device timezone">
                <input
                  type="datetime-local"
                  required
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Official contest URL">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Field>
            <div className="filters">
              <Field label="Rating after contest (optional)">
                <input
                  type="number"
                  min="0"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </Field>
              <Field label="Rank (optional)">
                <input
                  type="number"
                  min="1"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                />
              </Field>
            </div>
            <Button type="submit">Save contest</Button>
          </form>
        </section>
      </div>
      <section className="surface spaced">
        <h3>My calendar & performance</h3>
        {w.entries
          .filter((e) => e.kind === "contest")
          .map((e) => (
            <div className="list-row" key={e.id}>
              <div className="grow">
                <a
                  href={safeUrl(e.data.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  {e.title}
                </a>
                <small>
                  {e.data.platform} · {new Date(e.data.start).toLocaleString()}
                  {e.data.rating ? ` · Rating ${e.data.rating}` : ""}
                  {e.data.rank ? ` · Rank ${e.data.rank}` : ""}
                </small>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  eventCalendar(e.title, e.data.start, e.data.minutes || 120)
                }
              >
                Calendar
              </Button>
              <DeleteEntry id={e.id} />
            </div>
          ))}
        <p className="fine-print">
          Performance entries are self-reported. Calendar downloads can remind
          you outside the app.
        </p>
      </section>
      {live && (
        <section className="surface spaced">
          <h3>Try a virtual contest</h3>
          <p>Recent completed contests you can practise on Codeforces.</p>
          {live.virtual.map((c: any) => (
            <p key={c.id}>
              <a
                className="text-link"
                href={c.url}
                target="_blank"
                rel="noreferrer"
              >
                {c.title} ↗
              </a>
            </p>
          ))}
        </section>
      )}
    </>
  );
}
export function Notes() {
  const w = useWorkspace();
  const [search, setSearch] = useState(""),
    [title, setTitle] = useState(""),
    [text, setText] = useState(""),
    [topic, setTopic] = useState("STL"),
    [error, setError] = useState("");
  return (
    <>
      <Heading
        title="Keep what clicks."
        description="A searchable notebook for concepts, patterns and lessons from your mistakes."
      />
      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes">My notes</TabsTrigger>
          <TabsTrigger value="mistakes">Mistake notebook</TabsTrigger>
          <TabsTrigger value="gfg">GeeksforGeeks guides</TabsTrigger>
          <TabsTrigger value="generate">Generate notes</TabsTrigger>
          <TabsTrigger value="handbook">Foundation handbook</TabsTrigger>
        </TabsList>
        <TabsContent value="gfg"><GfgResources /></TabsContent>
        <TabsContent value="mistakes"><section className="surface spaced"><h3>Your debugging history</h3><p>Automatically captured test failures and later passing tests. Counts describe observed results, not a diagnosis of your skills.</p><div className="actions">{["Output mismatch","Compiler/runtime error","Execution issue","Test passed after practice"].map(category=><span className="tag" key={category}>{category}: {w.entries.filter(e=>e.kind==="note"&&e.data.source==="Automatic mistake notebook"&&e.data.topic===category).length}</span>)}</div>{w.entries.filter(e=>e.kind==="note"&&e.data.source==="Automatic mistake notebook").map(e=><details key={e.id}><summary>{e.title} · {new Date(e.created).toLocaleString()}</summary><Result text={e.data.text||""} label="Debugging note"/><DeleteEntry id={e.id}/></details>)}<p>Run custom tests in Code Studio with automatic mistake notes enabled to build this notebook.</p></section></TabsContent>
        <TabsContent value="notes">
          <div className="two-col spaced">
            <section className="surface">
              <h3>Capture a useful idea</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await w.save("note", title, {
                      text,
                      topic,
                      source: "Personal note",
                    });
                    setTitle("");
                    setText("");
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <Field label="Title">
                  <input
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Choice
                  label="Topic"
                  value={topic}
                  options={topics}
                  onChange={setTopic}
                />
                <Field label="Your note">
                  <textarea
                    required
                    rows={9}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </Field>
                <Button type="submit">Save note</Button>
                {error && <p className="error">{error}</p>}
              </form>
            </section>
            <section className="surface">
              <Field label="Search saved notes">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, topic or content"
                />
              </Field>
              {w.entries
                .filter(
                  (e) =>
                    e.kind === "note" &&
                    (e.title + " " + e.data.text + " " + e.data.topic)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                )
                .map((e) => (
                  <details className="lesson" key={e.id}>
                    <summary>{e.title}</summary>
                    <small>
                      {e.data.topic || e.data.source} ·{" "}
                      {new Date(e.created).toLocaleDateString()}
                    </small>
                    <Result text={e.data.text || ""} label="Saved note" />
                    <DeleteEntry id={e.id} />
                  </details>
                ))}
            </section>
          </div>
        </TabsContent>
        <TabsContent value="generate">
          <div className="spaced">
            <AIBox
              mode="notes"
              title="Build a revision note"
              placeholder="Explain OS deadlocks, SQL joins, graph traversal or any topic you are revising."
            />
          </div>
        </TabsContent>
        <TabsContent value="handbook">
          <div className="curriculum-grid spaced">
            {lessons.map((l) => (
              <section className="surface" key={l.title}>
                <span className="tag">{l.topic}</span>
                <h2>{l.title}</h2>
                <Result text={l.body} label="Foundation reference" />
              </section>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
export function GitHubView() {
  const w = useWorkspace();
  const [username, setUsername] = useState(w.profile.github),
    [data, setData] = useState<any>(null),
    [repo, setRepo] = useState<any>(null),
    [selected, setSelected] = useState(""),
    [source, setSource] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load(name?: string, extra = "") {
    setBusy(true);
    setError("");
    try {
      const d = await api(
        `github?user=${encodeURIComponent(username)}${name ? "&repo=" + encodeURIComponent(name) : ""}${extra}`,
      );
      if (extra) setSource(d.text || JSON.stringify(d.commit, null, 2));
      else if (name) {
        setRepo(d);
        setSelected(name);
        setSource("");
      } else {
        setData(d);
        setRepo(null);
        setSource("");
        await w.saveProfile({ ...w.profile, github: username });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Let your work tell the story."
        description="Explore public GitHub activity, inspect code and review a selected repository or commit."
      />
      <section className="surface">
        <form
          className="filters"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <Field label="Public GitHub username">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              pattern="[a-zA-Z0-9-]{1,39}"
            />
          </Field>
          <Button type="submit" disabled={busy}>
            <GitBranch />
            {busy ? "Loading…" : "Load public profile"}
          </Button>
        </form>
        <p className="fine-print">
          Public API connection. This does not authenticate you to GitHub or
          grant access to private repositories. Activity is the latest public
          events, not a complete contribution calendar.
        </p>
        {error && <p className="error">{error}</p>}
      </section>
      {data && (
        <>
          <div className="two-col spaced">
            <section className="surface">
              <h2>{data.user.name}</h2>
              <p>{data.user.bio}</p>
              <h3 className="spaced">Recently updated repositories</h3>
              {data.repos.map((r: any) => (
                <div className="list-row" key={r.name}>
                  <div className="grow">
                    <strong>{r.name}</strong>
                    <small>
                      {r.language || "No language"} · {r.stars} stars
                    </small>
                    <p>{r.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => load(r.name)}
                  >
                    Inspect
                  </Button>
                </div>
              ))}
            </section>
            <section className="surface">
              <h3>Recent public activity</h3>
              {data.events.length ? (
                data.events.map((e: any) => (
                  <div className="list-row" key={e.id}>
                    <div>
                      <strong>{e.type.replace("Event", "")}</strong>
                      <p>{e.repo}</p>
                      <small>{new Date(e.date).toLocaleString()}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent public events returned.</p>
              )}
            </section>
          </div>
          {repo && (
            <section className="surface spaced">
              <h2>{repo.metadata.name}</h2>
              <p>{repo.metadata.description}</p>
              <div className="two-col">
                <div>
                  <h3>Root files</h3>
                  {repo.files.map((f: any) => (
                    <Button
                      variant="ghost"
                      key={f.path}
                      disabled={busy}
                      onClick={() =>
                        load(selected, "&path=" + encodeURIComponent(f.path))
                      }
                    >
                      {f.name}
                    </Button>
                  ))}
                </div>
                <div>
                  <h3>Recent commits</h3>
                  {repo.commits.map((c: any) => (
                    <div className="list-row" key={c.sha}>
                      <div className="grow">
                        <p>{c.message.split("\n")[0]}</p>
                        <small>{c.sha.slice(0, 7)}</small>
                      </div>
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => load(selected, "&sha=" + c.sha)}
                      >
                        Inspect diff
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {source && (
                <Result text={source} label="Selected public source or diff" />
              )}
              <AIBox
                key={selected + source.slice(0, 80)}
                mode="repository"
                title="Review this evidence"
                initial={`Repository metadata:\n${JSON.stringify(repo.metadata)}\nSelected code or diff:\n${source || "No source selected. Give metadata-level suggestions only."}`}
                placeholder="Load a source file or commit above."
              />
            </section>
          )}
        </>
      )}
    </>
  );
}
export function Portfolio() {
  const w = useWorkspace(),
    s = statistics(w.entries, w.profile);
  const [kind, setKind] = useState("project"),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/files", { method: "POST", body: form });
      const d: any = await r.json();
      if (!r.ok) throw new Error(d.error);
      await w.save("certificate", file.name, {
        fileId: d.file.id,
        text: description,
      });
      await w.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const summary = `${w.profile.name}\n${w.profile.bio}\nSkills: ${w.profile.skills}\nGitHub: ${w.profile.github}\n${s.solved} unique problems marked solved; ${s.streak}-day active streak.\nProjects:\n${w.entries
    .filter((e) => e.kind === "project")
    .map((e) => `${e.title}: ${e.data.text} ${e.data.url}`)
    .join(
      "\n",
    )}\nContest records: ${JSON.stringify(w.entries.filter((e) => e.kind === "contest").map((e) => ({ title: e.title, rating: e.data.rating, rank: e.data.rank })))}`;
  return (
    <>
      <Heading
        title="Show the work behind your skills."
        description="Collect projects, certificates and practice evidence into a portfolio you can explain."
      />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Portfolio</TabsTrigger>
          <TabsTrigger value="resume">Resume helper</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <section className="portfolio-hero">
            <div className="avatar">
              {w.profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1>{w.profile.name}</h1>
              <p>{w.profile.bio || "Add your bio and skills in Settings."}</p>
              <div className="meta">
                {w.profile.skills
                  .split(",")
                  .filter(Boolean)
                  .map((skill) => (
                    <span className="tag" key={skill}>
                      {skill.trim()}
                    </span>
                  ))}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => download("coding-portfolio.md", summary)}
            >
              Export profile
            </Button>
          </section>
          <div className="two-col spaced">
            <section className="surface">
              <h3>Add work you are proud of</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  try {
                    await w.save(kind, title, {
                      text: description,
                      url: url ? safeUrl(url) : "",
                    });
                    setTitle("");
                    setDescription("");
                    setUrl("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <Choice
                  label="Entry type"
                  value={kind}
                  options={["project", "certificate"]}
                  onChange={setKind}
                />
                <Field label="Title">
                  <input
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field label="What you built or learned">
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
                <Field label="Project / credential URL">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </Field>
                <div className="actions">
                  <Button type="submit">Save entry</Button>
                  <label className="upload-button">
                    <Upload size={16} />
                    {busy ? "Uploading…" : "Upload certificate"}
                    <input
                      type="file"
                      disabled={busy}
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      onChange={(e) => void upload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </form>
              {error && <p className="error">{error}</p>}
            </section>
            <section className="surface">
              <h3>Your evidence</h3>
              <div className="stats-grid mini">
                <div className="stat">
                  <strong>{s.solved}</strong>
                  <span>Problems marked solved</span>
                </div>
                <div className="stat">
                  <strong>{s.coverage}%</strong>
                  <span>Learning coverage</span>
                </div>
              </div>
              {w.entries
                .filter((e) => ["project", "certificate"].includes(e.kind))
                .map((e) => (
                  <article className="list-row" key={e.id}>
                    <div className="grow">
                      <span className="tag">{e.kind}</span>
                      <h3>{e.title}</h3>
                      <p>{e.data.text}</p>
                      {e.data.url && (
                        <a
                          className="text-link"
                          href={safeUrl(e.data.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View evidence ↗
                        </a>
                      )}
                      {e.data.fileId && (
                        <a
                          className="text-link"
                          href={
                            "/api/files?id=" + encodeURIComponent(e.data.fileId)
                          }
                        >
                          Download certificate
                        </a>
                      )}
                    </div>
                    <DeleteEntry id={e.id} />
                  </article>
                ))}
            </section>
          </div>
          <div className="spaced">
            <AIBox
              key={summary}
              mode="portfolio"
              title="Draft your coding summary"
              initial={summary}
              placeholder="Your project and practice evidence"
            />
          </div>
        </TabsContent>
        <TabsContent value="resume">
          <div className="spaced">
            <AIBox
              mode="resume"
              title="Make every bullet count"
              initial={`My coding evidence:\n${summary}\n\nMy resume text:\n`}
              placeholder="Paste resume text and the role you are targeting."
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
export function Peers() {
  const w = useWorkspace();
  const [items, setItems] = useState<any[]>([]),
    [title, setTitle] = useState("Weekend coding challenge"),
    [problem, setProblem] = useState(problems[0].id),
    [deadline, setDeadline] = useState(""),
    [invite, setInvite] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function refresh() {
    try {
      const d = await api("challenges");
      setItems(d.challenges);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function action(data: any) {
    setBusy(true);
    setError("");
    try {
      await api("challenges", data);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="A little friendly accountability."
        description="Create a challenge, share its invite code and compare self-reported completion."
      />
      <p className="notice-inline">
        Friends need access to this Site and their own sign-in. An invite code
        does not grant Site access.
      </p>
      <div className="two-col spaced">
        <section className="surface">
          <h3>Create a challenge</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action({
                action: "create",
                title,
                problemId: problem,
                deadline: new Date(deadline).toISOString(),
                name: w.profile.name,
              });
            }}
          >
            <Field label="Challenge name">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Choice
              label="Problem"
              value={problem}
              options={problems.map((p) => p.id)}
              onChange={setProblem}
            />
            <Field label="Deadline · your device timezone">
              <input
                type="datetime-local"
                value={deadline}
                required
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
            <Button type="submit" disabled={busy}>
              Create challenge
            </Button>
          </form>
        </section>
        <section className="surface">
          <h3>Join your friends</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action({
                action: "join",
                id: invite.trim(),
                name: w.profile.name,
              });
            }}
          >
            <Field label="Invite code">
              <input
                required
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
              />
            </Field>
            <Button disabled={busy} type="submit">
              Join challenge
            </Button>
          </form>
        </section>
      </div>
      {error && <p className="error">{error}</p>}
      {items.map((c) => (
        <section className="surface spaced" key={c.id}>
          <div className="section-head">
            <h3>{c.title}</h3>
            <small>Ends {new Date(c.deadline).toLocaleString()}</small>
          </div>
          <a
            className="text-link"
            href={problems.find((p) => p.id === c.problem_id)?.url}
            target="_blank"
            rel="noreferrer"
          >
            {problems.find((p) => p.id === c.problem_id)?.title} ↗
          </a>
          <Field label="Invite code">
            <input readOnly value={c.id} onFocus={(e) => e.target.select()} />
          </Field>
          {c.members.map((m: any, i: number) => (
            <div className="list-row" key={i}>
              <strong>
                {m.name}
                {m.is_me ? " (you)" : ""}
              </strong>
              <span>{m.completed ? "Completed" : "In progress"}</span>
            </div>
          ))}
          <div className="actions">
            <Button
              disabled={
                busy ||
                c.members.some((m: any) => m.is_me && m.completed) ||
                new Date(c.deadline) < new Date()
              }
              onClick={() => action({ action: "complete", id: c.id })}
            >
              Mark my challenge complete
            </Button>
            <Button variant="outline" onClick={refresh}>
              Refresh progress
            </Button>
          </div>
        </section>
      ))}
    </>
  );
}
export function SettingsView() {
  const w = useWorkspace();
  const [form, setForm] = useState(w.profile),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => setForm(w.profile), [w.profile]);
  return (
    <>
      <Heading
        title="Make this workspace yours."
        description="Your goals, learning preferences and account settings."
      />
      <div className="two-col">
        <section className="surface">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await w.saveProfile(form);
                setError("");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <h3>Your profile</h3>
            <Field label="Display name">
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Bio">
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </Field>
            <SkillPicker
              value={form.skills}
              onChange={(skills) => setForm({ ...form, skills })}
            />
            <div className="filters">
              <Choice
                label="Learning level"
                value={form.level}
                options={["Beginner", "Intermediate", "Advanced"]}
                onChange={(level) => setForm({ ...form, level })}
              />
              <Choice
                label="Engineering branch"
                value={form.branch || branches[0]}
                options={branches}
                onChange={(branch) => setForm({ ...form, branch })}
              />
              <CompanyPicker
                value={
                  form.companies ||
                  (form.company === "General" ? [] : [form.company])
                }
                onChange={(companies) =>
                  setForm({
                    ...form,
                    companies,
                    company: companies[0] || "General",
                  })
                }
              />
              <Field label="Daily problem goal">
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.dailyGoal}
                  onChange={(e) =>
                    setForm({ ...form, dailyGoal: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Daily minutes">
                <input
                  type="number"
                  min="5"
                  max="480"
                  required
                  value={form.minutes}
                  onChange={(e) =>
                    setForm({ ...form, minutes: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <TimezonePicker value={form} onChange={setForm} />
            <Field label="Reminder time">
              <input
                type="time"
                value={form.reminder}
                required
                onChange={(e) => setForm({ ...form, reminder: e.target.value })}
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save preferences"}
            </Button>
            {error && <p className="error">{error}</p>}
          </form>
        </section>
        <div>
          <section className="surface">
            <GitHubConnect />
            <h3>Account & data</h3>
            <p>
              Sign in with your CodeMentor email and password. Your records and files
              are scoped to your identity on this Site.
            </p>
            <div className="actions">
              <form action="/api/auth/logout" method="post" onSubmit={()=>{try{sessionStorage.removeItem('codementor-code-draft');sessionStorage.removeItem('codementor-selected-problem');}catch{}}}><button type="submit" className="text-link">Sign out</button></form>
              <Button
                variant="outline"
                onClick={() =>
                  download(
                    "codementor-backup.json",
                    JSON.stringify(
                      {
                        exported: new Date().toISOString(),
                        profile: w.profile,
                        entries: w.entries,
                        files: w.files,
                      },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                Export my data
              </Button>
            </div>
          </section>
          <section className="surface spaced">
            <h3>Live AI connection</h3>
            <span className="tag">
              {w.ready ? "Connected" : "Not configured"}
            </span>
            <p>
              {w.ready
                ? "Your prompts are sent to the configured AI provider when you ask for AI help. Generated advice needs your review."
                : "Live AI needs OPENAI_API_KEY and OPENAI_MODEL in server environment settings. Keys never belong in browser forms or source code."}
            </p>
            <p className="fine-print">
              Static checks, quizzes, curriculum, trackers and notebook work
              independently of live AI.
            </p>
          </section>
          <section className="surface spaced">
            <h3>A reminder outside the app</h3>
            <p>
              Download an event for your next practice session and add it to
              your calendar. Choose recurrence in your calendar for daily
              reminders.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const date = new Date();
                const [h, m] = form.reminder.split(":").map(Number);
                date.setHours(h, m, 0, 0);
                if (date < new Date()) date.setDate(date.getDate() + 1);
                eventCalendar(
                  "CodeMentor: daily coding practice",
                  date.toISOString(),
                  form.minutes,
                );
              }}
            >
              Download practice reminder
            </Button>
          </section>
          <section className="surface spaced">
            <h3>Uploaded files</h3>
            {w.files.map((f) => (
              <div className="list-row" key={f.id}>
                <a href={"/api/files?id=" + f.id} className="text-link">
                  {f.name}
                </a>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await api("files", { id: f.id }, "DELETE");
                      await w.reload();
                    } catch (e) {
                      w.setNotice((e as Error).message);
                    }
                  }}
                >
                  Delete file
                </Button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
