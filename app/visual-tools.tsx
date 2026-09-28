"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Heading,
  Choice,
  Field,
  Result,
  AIBox,
  download,
  DeleteEntry,
} from "./ui-kit";
import { similarity } from "@/lib/learning";
import { useWorkspace } from "./workspace-context";
export function VisualLab() {
  const [structure, setStructure] = useState("Stack"),
    [values, setValues] = useState<number[]>([4, 8, 12]),
    [input, setInput] = useState("16"),
    [log, setLog] = useState(
      "Push an element or remove one to see how the structure behaves.",
    ),
    [step, setStep] = useState(0),
    [size, setSize] = useState(20),
    [left, setLeft] = useState(""),
    [right, setRight] = useState(""),
    [score, setScore] = useState<number | null>(null);
  const traversal =
    structure === "Tree"
      ? [8, 4, 12, 2, 6, 10, 14]
      : ["A", "B", "C", "D", "E", "F"];
  const points = Array.from({ length: size }, (_, i) => ({
    n: i + 1,
    "O(1)": 1,
    "O(log n)": Math.log2(i + 2),
    "O(n)": i + 1,
    "O(n log n)": (i + 1) * Math.log2(i + 2),
    "O(n²)": (i + 1) ** 2,
  }));
  function add() {
    const n = Number(input);
    if (!Number.isFinite(n) || input.trim() === "") {
      setLog("Enter a valid number.");
      return;
    }
    if (values.length >= 12) {
      setLog("This visual demo supports 12 elements. Remove one first.");
      return;
    }
    setValues([...values, n]);
    setLog(`Added ${n} at the ${structure === "Stack" ? "top" : "back"}.`);
  }
  function remove() {
    if (!values.length) {
      setLog("The structure is empty. Check empty() before removing.");
      return;
    }
    setLog(
      `Removed ${structure === "Stack" ? values.at(-1) : values[0]}. ${structure === "Stack" ? "Last in, first out." : "First in, first out."}`,
    );
    setValues(structure === "Stack" ? values.slice(0, -1) : values.slice(1));
  }
  return (
    <>
      <Heading
        title="See the algorithm happen."
        description="Explore data structures, compare growth rates and inspect code similarity."
      />
      <Tabs defaultValue="structures">
        <TabsList>
          <TabsTrigger value="structures">Data structures</TabsTrigger>
          <TabsTrigger value="complexity">Complexity explorer</TabsTrigger>
          <TabsTrigger value="similarity">Code similarity</TabsTrigger>
        </TabsList>
        <TabsContent value="structures">
          <section className="surface spaced">
            <Choice
              label="Structure"
              value={structure}
              options={["Stack", "Queue", "Tree", "Graph"]}
              onChange={(v) => {
                setStructure(v);
                setStep(0);
              }}
            />
            {["Stack", "Queue"].includes(structure) ? (
              <>
                <div className={`simulator ${structure.toLowerCase()}`}>
                  {values.map((n, i) => (
                    <div className="sim-node" key={i}>
                      <strong>{n}</strong>
                      <small>
                        {structure === "Stack"
                          ? i === values.length - 1
                            ? "top"
                            : ""
                          : i === 0
                            ? "front"
                            : i === values.length - 1
                              ? "back"
                              : ""}
                      </small>
                    </div>
                  ))}
                </div>
                <div className="filters">
                  <Field label="Value">
                    <input
                      type="number"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </Field>
                  <Button onClick={add}>
                    {structure === "Stack" ? "Push" : "Enqueue"}
                  </Button>
                  <Button variant="outline" onClick={remove}>
                    {structure === "Stack" ? "Pop" : "Dequeue"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setValues([]);
                      setLog("Cleared.");
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <p className="hint-box" aria-live="polite">
                  {log}
                </p>
                <p className="fine-print">
                  Conceptual operations: O(1) push/pop or enqueue/dequeue. The
                  visual UI uses array copies for rendering.
                </p>
              </>
            ) : (
              <>
                <div className="graph-wrap">
                  <svg
                    viewBox="0 0 600 300"
                    role="img"
                    aria-label={`${structure} breadth-first traversal`}
                  >
                    <g
                      stroke="currentColor"
                      strokeOpacity=".25"
                      strokeWidth="2"
                    >
                      {structure === "Tree"
                        ? [
                            [300, 40, 160, 130],
                            [300, 40, 440, 130],
                            [160, 130, 80, 240],
                            [160, 130, 230, 240],
                            [440, 130, 370, 240],
                            [440, 130, 520, 240],
                          ].map((e, i) => (
                            <line
                              key={i}
                              x1={e[0]}
                              y1={e[1]}
                              x2={e[2]}
                              y2={e[3]}
                            />
                          ))
                        : [
                            [100, 140, 230, 50],
                            [100, 140, 230, 230],
                            [230, 50, 400, 50],
                            [230, 50, 400, 230],
                            [230, 230, 400, 230],
                            [400, 50, 530, 140],
                            [400, 230, 530, 140],
                          ].map((e, i) => (
                            <line
                              key={i}
                              x1={e[0]}
                              y1={e[1]}
                              x2={e[2]}
                              y2={e[3]}
                            />
                          ))}
                    </g>
                    {(structure === "Tree"
                      ? [
                          [300, 40],
                          [160, 130],
                          [440, 130],
                          [80, 240],
                          [230, 240],
                          [370, 240],
                          [520, 240],
                        ]
                      : [
                          [100, 140],
                          [230, 50],
                          [230, 230],
                          [400, 50],
                          [400, 230],
                          [530, 140],
                        ]
                    ).map(([x, y], i) => (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="24"
                          fill={i < step ? "#4b50d1" : "#e6e9f5"}
                        />
                        <text
                          x={x}
                          y={y + 6}
                          textAnchor="middle"
                          fill={i < step ? "white" : "#253354"}
                          fontSize="18"
                        >
                          {traversal[i]}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="actions">
                  <Button
                    disabled={step >= traversal.length}
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Next BFS step
                  </Button>
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Reset
                  </Button>
                </div>
                <p className="hint-box">
                  Visited: {traversal.slice(0, step).join(" → ") || "none"}.{" "}
                  {step < traversal.length
                    ? `Next: ${traversal[step]}`
                    : "Traversal complete."}
                </p>
                <p>
                  Example breadth-first traversal with fixed neighbor order. A
                  queue visits nodes in layers. Graph traversal uses a visited
                  set to avoid repeated visits. Time O(V + E), auxiliary space
                  O(V).
                </p>
              </>
            )}
          </section>
        </TabsContent>
        <TabsContent value="complexity">
          <section className="surface spaced">
            <h3>How does work grow with input size?</h3>
            <Field label={`Maximum n: ${size}`}>
              <input
                type="range"
                min="5"
                max="100"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </Field>
            <div style={{ height: 360, width: "100%" }}>
              <ResponsiveContainer>
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="n" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)"].map(
                    (key, i) => (
                      <Line
                        key={key}
                        dataKey={key}
                        dot={false}
                        stroke={
                          [
                            "#a2a8b5",
                            "#119780",
                            "#428bdd",
                            "#ad67cd",
                            "#e07855",
                          ][i]
                        }
                        strokeWidth={2}
                      />
                    ),
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p>
              Illustrative operation counts with constants omitted, not runtime
              measurements. Logarithmic curves use log₂(n+1) so the first point
              remains visible. Memory complexity describes additional storage as
              input grows.
            </p>
          </section>
          <div className="spaced">
            <AIBox
              mode="complexity"
              title="Analyse your own approach"
              placeholder="Paste code plus input assumptions. The mentor will estimate time and space and show a sample dry run."
            />
          </div>
        </TabsContent>
        <TabsContent value="similarity">
          <section className="surface spaced">
            <h3>Compare two code samples</h3>
            <p>
              Use overlap as a starting point for a review. A similarity score
              cannot establish plagiarism, authorship or intent.
            </p>
            <div className="two-col">
              <Field label="First sample">
                <textarea
                  rows={13}
                  value={left}
                  maxLength={50000}
                  onChange={(e) => setLeft(e.target.value)}
                />
              </Field>
              <Field label="Second sample">
                <textarea
                  rows={13}
                  value={right}
                  maxLength={50000}
                  onChange={(e) => setRight(e.target.value)}
                />
              </Field>
            </div>
            <Button
              disabled={!left.trim() || !right.trim()}
              onClick={() => setScore(similarity(left, right))}
            >
              Compare token overlap
            </Button>
            {score !== null && (
              <div className="similarity-score">
                <strong>{score}%</strong>
                <p>
                  Jaccard overlap of unique tokens. Whitespace, C-style comments
                  and numeric literals are normalized. Shared boilerplate can
                  inflate this result; renamed variables can reduce it.
                </p>
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </>
  );
}
export function Interview() {
  const w = useWorkspace();
  const [recordMode, setRecordMode] = useState("Audio only"),
    [question, setQuestion] = useState(
      "Explain how you would find the shortest path in an unweighted graph.",
    ),
    [transcript, setTranscript] = useState(""),
    [recording, setRecording] = useState(false),
    [blob, setBlob] = useState<Blob | null>(null),
    [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  async function start() {
    setError("");
    try {
      if (!navigator.mediaDevices || !window.MediaRecorder)
        throw new Error(
          "Recording is unavailable in this browser. Type your answer below.",
        );
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video:
          recordMode === "Audio & video" ? { width: 640, height: 360 } : false,
      });
      const r = new MediaRecorder(stream.current, {
        videoBitsPerSecond: 250000,
        audioBitsPerSecond: 48000,
      });
      recorder.current = r;
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = () => {
        setBlob(new Blob(chunks, { type: r.mimeType }));
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        if (timer.current) clearTimeout(timer.current);
      };
      r.start();
      setRecording(true);
      timer.current = setTimeout(() => {
        if (r.state === "recording") r.stop();
      }, 180000);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      let fileId = "";
      if (blob) {
        const f = new FormData();
        f.set(
          "file",
          new File([blob], "mock-interview.webm", { type: blob.type }),
        );
        const r = await fetch("/api/files", { method: "POST", body: f });
        const d: any = await r.json();
        if (!r.ok) throw new Error(d.error);
        fileId = d.file.id;
      }
      await w.save("interview", question.slice(0, 150), {
        text: transcript,
        fileId,
      });
      await w.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Practise saying it out loud."
        description="Record a mock answer, reflect on your explanation and get feedback on your transcript."
      />
      <div className="two-col">
        <section className="surface">
          <Field label="Interview question">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </Field>
          <Choice
            label="Recording mode"
            value={recordMode}
            options={["Audio only", "Audio & video"]}
            onChange={setRecordMode}
          />
          <div className="recording-panel">
            <span
              className={
                recording ? "record-indicator active" : "record-indicator"
              }
            />
            <h3>
              {recording
                ? "Recording your answer…"
                : "Your next interview starts here."}
            </h3>
            <p>
              Audio or video · maximum 3 minutes · microphone permission
              requested when you start.
            </p>
            <div className="actions">
              <Button disabled={recording} onClick={start}>
                Start recording
              </Button>
              <Button
                variant="outline"
                disabled={!recording}
                onClick={() => recorder.current?.stop()}
              >
                Stop
              </Button>
            </div>
            {url &&
              (blob?.type.startsWith("video") ? (
                <video controls src={url} style={{ width: "100%" }} />
              ) : (
                <audio controls src={url} />
              ))}
          </div>
          {blob && (
            <Button
              variant="outline"
              disabled={busy || recording}
              onClick={async () => {
                setBusy(true);
                try {
                  const f = new FormData();
                  f.set(
                    "file",
                    new File(
                      [blob],
                      blob.type.includes("mp4") ? "answer.mp4" : "answer.webm",
                      { type: blob.type },
                    ),
                  );
                  const r = await fetch("/api/transcribe", {
                    method: "POST",
                    body: f,
                  });
                  const d: any = await r.json();
                  if (!r.ok) throw new Error(d.error);
                  setTranscript(d.text);
                  setError("");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Transcribe with AI
            </Button>
          )}
          <Field label="Answer transcript or typed response">
            <textarea
              rows={8}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type or paste what you said. Feedback uses this text; recording is saved for your playback."
            />
          </Field>
          <Button
            disabled={busy || recording || (!transcript && !blob)}
            onClick={save}
          >
            {busy ? "Saving…" : "Save interview"}
          </Button>
          {error && <p className="error">{error}</p>}
        </section>
        <AIBox
          key={question + transcript}
          mode="interview"
          title="Review your answer"
          initial={`Question: ${question}\nMy answer: ${transcript}`}
          placeholder="Question and answer transcript"
          saveKind="note"
        />
      </div>
      <section className="surface spaced">
        <h3>Past interviews</h3>
        {w.entries
          .filter((e) => e.kind === "interview")
          .map((e) => (
            <details className="lesson" key={e.id}>
              <summary>{e.title}</summary>
              <Result
                text={e.data.text || "No transcript saved."}
                label="Your answer"
              />
              {e.data.fileId && (
                <a
                  href={"/api/files?id=" + e.data.fileId}
                  className="text-link"
                >
                  Download recording
                </a>
              )}
              <DeleteEntry id={e.id} />
            </details>
          ))}
      </section>
    </>
  );
}
