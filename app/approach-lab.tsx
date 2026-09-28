"use client";
import { useState } from "react";
import { z } from "zod";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { api } from "./workspace-context";
import { Result } from "./ui-kit";
const growth = z.enum(["1", "logn", "n", "nlogn", "n2", "n3", "2n", "unknown"]);
const schema = z.object({
  approaches: z
    .array(
      z.object({
        name: z.string(),
        explanation: z.string(),
        code: z.string(),
        time: growth,
        space: growth,
        assumptions: z.string(),
      }),
    )
    .min(1)
    .max(4),
});
const evaluate = (type: string, n: number): number | undefined =>
  ({
    "1": 1,
    logn: Math.log2(n),
    n,
    nlogn: n * Math.log2(n),
    n2: n * n,
    n3: n * n * n,
    "2n": 2 ** n,
  })[type];
export function ApproachLab({
  code,
  language,
  context,
}: {
  code: string;
  language: string;
  context: string;
}) {
  const [result, setResult] = useState<z.infer<typeof schema> | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [signature, setSignature] = useState("");
  const current = JSON.stringify([code, language, context]);
  const colors = ["#6366f1", "#10b981", "#f59e0b", "#e879f9"];
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const response = await api("ai", {
        mode: "approaches",
        language,
        text: `Problem: ${context}\nExisting code:\n${code}`,
      });
      setResult(
        schema.parse(
          JSON.parse(
            response.text
              .replace(/^```(?:json)?\s*/, "")
              .replace(/\s*```$/, ""),
          ),
        ),
      );
      setSignature(current);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="surface spaced">
      <h3>Brute force → optimized</h3>
      <p>Compare algorithms, code and time/space tradeoffs in {language}.</p>
      <Button disabled={busy || !code.trim()} onClick={generate}>
        {busy ? "Comparing approaches…" : "Generate solution comparison"}
      </Button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <>
          {signature !== current && (
            <p role="status">
              Code, language or problem changed. Generate again to update this
              comparison.
            </p>
          )}
          {(["time", "space"] as const).map((metric) => (
            <div key={metric}>
              <h4>{metric === "time" ? "Time" : "Auxiliary space"} growth</h4>
              <p>
                Illustrative growth units, not measured runtime or memory.
                Logarithmic vertical axis. Unknown/multivariable bounds are
                omitted.
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={Array.from({ length: 20 }, (_, i) => {
                    const n = i + 2;
                    return Object.fromEntries([
                      ["n", n],
                      ...result.approaches.map((a, j) => [
                        "a" + j,
                        evaluate(a[metric], n),
                      ]),
                    ]);
                  })}
                >
                  <XAxis dataKey="n" />
                  <YAxis scale="log" domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend />
                  {result.approaches.map((a, j) => (
                    <Line
                      key={j}
                      dataKey={"a" + j}
                      name={`${a.name} · ${a[metric]}`}
                      stroke={colors[j]}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
          {result.approaches.map((a, i) => (
            <article className="surface spaced" key={i}>
              <h4>
                {i + 1}. {a.name}
              </h4>
              <p>{a.explanation}</p>
              <p>
                Time: {a.time} · Auxiliary space: {a.space}
              </p>
              <p>{a.assumptions}</p>
              <Result
                text={"```\n" + a.code + "\n```"}
                label="AI-generated code · not executed"
              />
            </article>
          ))}
        </>
      )}
    </section>
  );
}
