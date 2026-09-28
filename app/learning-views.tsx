"use client";
import { TopicPracticeLibrary } from "./topic-practice-library";
import { StreakPanel } from "./streak-panel";
import { PlatformProblemBank } from "./platform-problem-bank";
import { GuidedPractice } from "./guided-practice";
import { Competitive } from "./curriculum-views";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Flame,
  Target,
  Clock,
  Trophy,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import {
  topics,
  problems,
  quizBank,
  statistics,
  shiftDay,
  companyTopics,
} from "@/lib/learning";
import { useWorkspace, api } from "./workspace-context";
import { Heading, Choice, Field, Empty, AIBox, DeleteEntry } from "./ui-kit";
export function Overview({ navigate }: { navigate: (s: string) => void }) {
  const w = useWorkspace(),
    s = statistics(w.entries, w.profile);
  const reminders = [
    s.todaySolved < w.profile.dailyGoal
      ? `${w.profile.dailyGoal - s.todaySolved} more solved problem(s) to meet today’s goal.`
      : "Daily goal completed. Good time to review your mistakes.",
    ...s.byTopic
      .filter((t) => t.attempts && t.accuracy !== null && t.accuracy < 60)
      .slice(0, 2)
      .map((t) => `Revisit ${t.topic}: your quiz accuracy is ${t.accuracy}%.`),
  ];
  const upcoming = w.entries
    .filter(
      (e) =>
        e.kind === "contest" &&
        e.data.start &&
        new Date(e.data.start) > new Date(),
    )
    .sort((a, b) => a.data.start.localeCompare(b.data.start))[0];
  return (
    <>
      <Heading
        title={`Make today count${w.profile.name !== "Your workspace" ? ", " + w.profile.name.split(" ")[0] : ""}.`}
        description="Your practice, progress and next steps in one place."
      />
      <StreakPanel navigate={navigate} />
      <div className="stats-grid">
        {[
          [BookOpen, w.entries.filter(e=>e.kind==="note").length, "Saved notes", "your learning library"],
          [Target, s.solved, "Problems solved", "self-reported, unique"],
          [Clock, s.minutes, "This week", "practice minutes"],
          [CheckCircle2, s.weeklyDays, "Active days", "in the last 7 days"],
        ].map(([Icon, value, label, detail]: any) => (
          <section className="stat" key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </section>
        ))}
      </div>
      <div className="two-col spaced">
        <section className="surface focus-card"><span className="eyebrow">YOUR NEXT STEP</span><h2>Choose a topic. Build the habit.</h2><p>Continue your practice path, or revisit a concept in your notes.</p><div className="actions"><Button onClick={()=>navigate('Practice & quizzes')}>Explore questions <ArrowRight/></Button><Button variant="outline" onClick={()=>navigate('Notes')}>Review notes</Button></div></section>
        <section className="surface">
          <h3>Your reminders</h3>
          {reminders.map((r) => (
            <p className="reminder" key={r}>
              {r}
            </p>
          ))}
          {upcoming && (
            <p className="reminder">
              Next contest: {upcoming.title} ·{" "}
              {new Date(upcoming.data.start).toLocaleString()}
            </p>
          )}
          <p className="fine-print">
            Reminders update while this app is open. Settings includes a
            calendar reminder for when it is closed.
          </p>
        </section>
      </div>
      <section className="surface spaced"><h3>CodeMentor acceptance rate</h3>{(()=>{const submitted=w.entries.filter(e=>e.kind==='submission'),accepted=submitted.filter(e=>e.data.verdict==='Accepted');return <><strong>{submitted.length?Math.round(accepted.length/submitted.length*100)+'%':'—'}</strong><p>{accepted.length} accepted / {submitted.length} judged submissions · fixed CodeMentor test suite only</p></>;})()}</section>

      <section className="surface spaced">
        <h3>Continue your journey</h3>
        <div className="quick-links">
          {[
            "Zero to hero",
            "Code studio",
            "Notes",
            "Sheet library",
            "My roadmap",
            "Portfolio",
          ].map((n) => (
            <Button key={n} variant="outline" onClick={() => navigate(n)}>
              {n}
              <ArrowRight />
            </Button>
          ))}
        </div>
      </section>
    </>
  );
}
export function Practice() {
  const w = useWorkspace(),
    s = statistics(w.entries, w.profile);
  const [topic, setTopic] = useState("All topics"),
    [difficulty, setDifficulty] = useState("Any difficulty"),
    [minutes, setMinutes] = useState("60"),
    [company, setCompany] = useState(w.profile.company),
    [search, setSearch] = useState(""),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [quizTopic, setQuizTopic] = useState("Arrays"),
    [answer, setAnswer] = useState(-1),
    [grade, setGrade] = useState<any>(null),
    [showHint, setShowHint] = useState("");
  const q = quizBank.find((q) => q.topic === quizTopic)!;
  const filtered = problems
    .filter(
      (p) =>
        (topic === "All topics" || p.topic === topic) &&
        (difficulty === "Any difficulty" || p.difficulty === difficulty) &&
        p.minutes <= Number(minutes) &&
        (companyTopics[company] || companyTopics.General).includes(p.topic) &&
        p.title.toLowerCase().includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        (s.byTopic.find((t) => t.topic === a.topic)?.coverage || 0) -
        (s.byTopic.find((t) => t.topic === b.topic)?.coverage || 0),
    );
  async function log(id: string, title: string, solved: boolean) {
    setBusy(id);
    setError("");
    try {
      await w.save("attempt", title, {
        problemId: id,
        minutes: Math.min(
          Number(minutes),
          problems.find((p) => p.id === id)!.minutes,
        ),
        solved,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function submit() {
    setBusy("quiz");
    setError("");
    try {
      const d = await api("quiz", { id: q.id, answer });
      setGrade(d);
      w.addEntry(d.entry);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <Heading
        title="Practice with purpose."
        description="Find a manageable challenge, check your understanding and build consistency."
      />
      <Tabs defaultValue="topic-library">
        <TabsList>
          <TabsTrigger value="topic-library">Topic progress</TabsTrigger>
          <TabsTrigger value="guided">Learn & practice</TabsTrigger>

          <TabsTrigger value="problems">Log practice</TabsTrigger>
          <TabsTrigger value="quiz">Topic quizzes</TabsTrigger>
          <TabsTrigger value="company">Company preparation</TabsTrigger>
        </TabsList>
        <TabsContent value="topic-library"><TopicPracticeLibrary/></TabsContent>
        <TabsContent value="guided"><GuidedPractice/></TabsContent>
        <TabsContent value="competitive">
          <Competitive />
        </TabsContent>
        <TabsContent value="problems">
          <section className="surface spaced">
            <div className="filters">
              <Choice
                label="Topic"
                value={topic}
                options={["All topics", ...topics.slice(0, 10)]}
                onChange={setTopic}
              />
              <Choice
                label="Difficulty"
                value={difficulty}
                options={["Any difficulty", "Easy", "Medium"]}
                onChange={setDifficulty}
              />
              <Choice
                label="Time available"
                value={minutes}
                options={["15", "20", "30", "45", "60"]}
                onChange={setMinutes}
              />
              <Field label="Find a problem">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search titles"
                />
              </Field>
            </div>
            <p className="fine-print">
              Suggested order uses your topic coverage. Open the original
              problem to submit and verify your solution.
            </p>
            {filtered.length === 0 && (
              <Empty
                title="No matching problems"
                detail="Try more time, another topic, or a broader difficulty."
              />
            )}
            {filtered.map((p) => {
              const solved = w.entries.some(
                (e) =>
                  e.kind === "attempt" &&
                  e.data.problemId === p.id &&
                  e.data.solved,
              );
              return (
                <article className="problem-row" key={p.id}>
                  <div className={`problem-icon ${solved ? "complete" : ""}`}>
                    {solved ? <CheckCircle2 /> : <BookOpen />}
                  </div>
                  <div className="grow">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="problem-title"
                    >
                      {p.title} ↗
                    </a>
                    <div className="meta">
                      <span
                        className={`difficulty ${p.difficulty.toLowerCase()}`}
                      >
                        {p.difficulty}
                      </span>
                      <span>{p.topic}</span>
                      <span>{p.minutes} min suggested</span>
                    </div>
                    {showHint === p.id && <p className="hint-box">{p.hint}</p>}
                  </div>
                  <div className="row-actions">
                    <Button
                      variant="ghost"
                      onClick={() => setShowHint(showHint === p.id ? "" : p.id)}
                    >
                      Hint
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!!busy}
                      onClick={() => log(p.id, p.title, false)}
                    >
                      Log attempt
                    </Button>
                    <Button
                      disabled={!!busy || solved}
                      onClick={() => log(p.id, p.title, true)}
                    >
                      {solved ? "Solved" : "Mark solved"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        </TabsContent>
        <TabsContent value="quiz">
          <div className="two-col spaced">
            <section className="surface">
              <Choice
                label="Quiz topic"
                value={quizTopic}
                options={topics}
                onChange={(v) => {
                  setQuizTopic(v);
                  setAnswer(-1);
                  setGrade(null);
                }}
              />
              <h2 className="quiz-question">{q.q}</h2>
              <div className="quiz-options">
                {q.options.map((o, i) => (
                  <button
                    key={o}
                    disabled={!!grade}
                    className={`${answer === i ? "selected" : ""} ${grade && grade.answer === i ? "correct" : ""}`}
                    onClick={() => setAnswer(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {o}
                  </button>
                ))}
              </div>
              <Button
                disabled={answer < 0 || !!grade || !!busy}
                onClick={submit}
              >
                Check answer
              </Button>
              {grade && (
                <div className="hint-box">
                  <h3>{grade.correct ? "Correct." : "Let’s unpack that."}</h3>
                  <p>{grade.why}</p>
                </div>
              )}
              <p className="fine-print">
                Hand-authored foundation quiz. Scores are calculated by the
                server and saved to Insights.
              </p>
            </section>
            <AIBox
              mode="quiz"
              title="Generate a deeper quiz"
              placeholder="Create a medium-level quiz on graph traversal."
              initial={`Create five ${w.profile.level.toLowerCase()} questions on ${quizTopic}.`}
            />
          </div>
        </TabsContent>
        <TabsContent value="company">
          <section className="surface spaced">
            <Choice
              label="Preparation target"
              value={company}
              options={Object.keys(companyTopics)}
              onChange={setCompany}
            />
            <h2>{company} preparation workspace</h2>
            <p>
              Suggested topic coverage:{" "}
              {(companyTopics[company] || companyTopics.General).join(", ")}.
            </p>
            <p className="fine-print">
              These are editorial practice tracks, not verified company question
              frequencies or hiring predictions. The selected track also filters
              DSA practice.
            </p>
            <div className="topic-grid">
              {s.byTopic
                .filter((t) =>
                  (companyTopics[company] || companyTopics.General).includes(
                    t.topic,
                  ),
                )
                .map((t) => (
                  <div key={t.topic}>
                    <strong>{t.topic}</strong>
                    <Progress value={t.coverage} />
                    <small>
                      {t.solved} unique solved · {t.coverage}% learning coverage
                    </small>
                  </div>
                ))}
            </div>
            <AIBox
              mode="interview"
              title="Prepare a mock interview"
              placeholder="Ask for an interview practice scenario."
              initial={`Give me a mock interview problem for a ${w.profile.level} student targeting ${company}. Use ${(companyTopics[company] || companyTopics.General).join(", ")}. Do not claim the problem was asked by the company.`}
            />
          </section>
        </TabsContent>
      </Tabs>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
export function Insights({ compact = false }: { compact?: boolean }) {
  const w = useWorkspace(),
    s = statistics(w.entries, w.profile);
  const badges = [
    ["7-Day Streak", s.longest >= 7, `${s.longest}/7 days`],
    [
      "Array Master",
      (s.byTopic.find((t) => t.topic === "Arrays")?.solved || 0) >= 3,
      "3 unique array problems",
    ],
    [
      "Graph Explorer",
      (s.byTopic.find((t) => t.topic === "Graphs")?.solved || 0) >= 2,
      "2 unique graph problems",
    ],
    [
      "STL Expert",
      w.entries.filter((e) => e.data.topic === "STL" && e.data.correct)
        .length >= 3,
      "3 correct STL quiz attempts",
    ],
    ["100 Problems Solved", s.solved >= 100, `${s.solved}/100 unique problems`],
  ];
  return (
    <>
      {!compact && (
        <Heading
          title="See how far you’ve come."
          description="Your actual practice activity, topic coverage and achievements."
        />
      )}
      <section className="surface spaced">
        <div className="section-head">
          <h3>Consistency over intensity</h3>
          <span className="tag">
            {s.weeklyDays}/7 active days this week · {s.week} attempts
          </span>
        </div>
        <div className="heatmap" aria-label="Last 84 days of activity">
          {Array.from({ length: 84 }, (_, i) => shiftDay(s.today, i - 83)).map(
            (d) => (
              <div
                className={s.dates.includes(d) ? "active" : ""}
                key={d}
                title={`${d}: ${s.dates.includes(d) ? "practice logged" : "no activity"}`}
                aria-label={`${d}: ${s.dates.includes(d) ? "active" : "no activity"}`}
              />
            ),
          )}
        </div>
        <p className="fine-print">
          Past 12 weeks · {w.profile.timezone} · Activity includes quiz and
          problem attempts.
        </p>
      </section>
      {!compact && (
        <>
          <section className="surface spaced">
            <h3>Skill coverage</h3>
            <p>
              Each topic reaches 100% after three distinct solved problems or
              correctly answered quiz questions. This measures coverage, not
              mastery or placement probability.
            </p>
            <div className="topic-grid">
              {s.byTopic.map((t) => (
                <div key={t.topic}>
                  <div className="section-head">
                    <strong>{t.topic}</strong>
                    <span>{t.coverage}%</span>
                  </div>
                  <Progress
                    value={t.coverage}
                    aria-label={`${t.topic} coverage`}
                  />
                  <small>
                    {t.solved} solved · Quiz{" "}
                    {t.accuracy === null
                      ? "not attempted"
                      : `${t.accuracy}% accuracy`}
                  </small>
                </div>
              ))}
            </div>
          </section>
          <section className="surface spaced">
            <h3>Achievements</h3>
            <div className="badge-grid">
              {badges.map(([title, earned, detail]) => (
                <div
                  key={String(title)}
                  className={`achievement ${earned ? "earned" : ""}`}
                >
                  <Trophy />
                  <strong>{title}</strong>
                  <small>{detail}</small>
                  <span>{earned ? "Earned" : "In progress"}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="surface spaced">
            <h3>Activity history</h3>
            {w.entries
              .filter((e) => e.kind === "attempt")
              .slice(0, 40)
              .map((e) => (
                <div className="list-row" key={e.id}>
                  <div>
                    <strong>{e.title}</strong>
                    <small>
                      {e.data.source} ·{" "}
                      {e.data.source === "quiz"
                        ? e.data.correct
                          ? "Correct"
                          : "Needs revision"
                        : e.data.solved
                          ? "Marked solved"
                          : "Attempted"}{" "}
                      · {new Date(e.created).toLocaleDateString()}
                    </small>
                  </div>
                  <DeleteEntry id={e.id} />
                </div>
              ))}
          </section>
        </>
      )}
    </>
  );
}
export function Roadmap() {
  const w = useWorkspace(),
    s = statistics(w.entries, w.profile);
  const sorted = [...s.byTopic].sort((a, b) => a.coverage - b.coverage);
  return (
    <>
      <Heading
        title="A path that grows with you."
        description="Build foundations, revisit weak areas and make your next session count."
      />
      <div className="two-col">
        <section className="surface">
          <div className="section-head">
            <h3>Your learning coverage</h3>
            <strong>{s.coverage}%</strong>
          </div>
          <Progress value={s.coverage} />
          <p className="fine-print">
            Coverage across 10 DSA and OOP topics. This is not a
            placement-readiness prediction.
          </p>
          <div className="roadmap-list">
            {sorted.map((t, i) => (
              <article key={t.topic}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t.topic}</h3>
                  <p>
                    {t.coverage === 0
                      ? "Start with the foundation lesson and one easy problem."
                      : t.accuracy !== null && t.accuracy < 60
                        ? "Review quiz mistakes before another timed problem."
                        : "Try a new problem and explain your complexity aloud."}
                  </p>
                  <small>
                    {t.last
                      ? `Revisit around ${shiftDay(t.last.slice(0, 10), t.coverage >= 67 ? 7 : 3)}`
                      : "Ready to start"}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
        <div>
          <AIBox
            mode="roadmap"
            title="Personalise with your mentor"
            initial={`I have ${w.profile.minutes} minutes daily. Level: ${w.profile.level}. Progress: ${JSON.stringify(s.byTopic)}. Suggest next topics and revision.`}
            placeholder="Tell your mentor your time and goals."
          />
          <section className="surface spaced">
            <h3>Revision schedule</h3>
            <p>Save a topic with a date to keep it on your radar.</p>
            <RevisionForm />
            {w.entries
              .filter((e) => e.kind === "revision")
              .map((e) => (
                <div className="list-row" key={e.id}>
                  <div>
                    <strong>{e.title}</strong>
                    <small>
                      {e.data.date} · {e.data.text}
                    </small>
                  </div>
                  <DeleteEntry id={e.id} />
                </div>
              ))}
          </section>
        </div>
      </div>
    </>
  );
}
function RevisionForm() {
  const w = useWorkspace();
  const [topic, setTopic] = useState("Arrays"),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await w.save("revision", topic, {
            date,
            text: "Review notes, retry one problem, explain the approach.",
          });
          setError("");
        } catch (e) {
          setError((e as Error).message);
        }
      }}
    >
      <div className="filters">
        <Choice
          label="Topic"
          value={topic}
          options={topics}
          onChange={setTopic}
        />
        <Field label="Revision date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>
      </div>
      <Button type="submit" variant="outline">
        Schedule revision
      </Button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
