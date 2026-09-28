"use client";
import type {GuidedProblem} from '@/lib/guided-problems';
export function ProblemDescription({problem:p}:{problem:GuidedProblem}) {
 const params=(p.code.match(/function solve\(([^)]*)\)/)?.[1]||'input').split(',').map(s=>s.trim());
 function readableInput(input:string){try{return (JSON.parse(input) as unknown[]).map((value,i)=>`${params[i]||'argument '+(i+1)} = ${JSON.stringify(value)}`).join('\n');}catch{return input;}}
 return <article className="problem-description"><div className="problem-badges"><span>{p.difficulty||'Easy'}</span><span>{p.topic}</span></div><h2>{p.title}</h2><p>{p.statement}</p>
 <h3>Function</h3><pre><code>solve({params.join(', ')})</code></pre>
 {p.examples.map((e,i)=><section className="problem-example" key={i}><h3>Example {i+1}</h3><strong>Input</strong><pre><code>{readableInput(e.input)}</code></pre><strong>Output</strong><pre><code>{e.output}</code></pre><p><strong>Explanation: </strong>{e.why}</p></section>)}
 <h3>Constraints</h3><ul className="problem-constraints">{p.constraints.split(/[;\n]+/).filter(c=>c.trim()).map((constraint,i)=><li key={i}>{constraint.trim()}</li>)}</ul>
 <details><summary>How to use the test console</summary><p>Examples above show named arguments. The console takes those values inside one JSON array. JavaScript starters already read this input and print JSON output.</p><pre><code>{p.tests?.[0]?.input}</code></pre><p>Sample tests are preloaded. Preserve the same input/output contract when using another language.</p></details>
 <h3>Hints</h3>{p.hints.map((hint,i)=><details key={i}><summary>Hint {i+1}</summary><p>{hint}</p></details>)}
 <details><summary>Walk through an example</summary><ol>{p.steps.map((step,i)=><li key={i}>{step}</li>)}</ol></details>
 <small>Original CodeMentor exercise. Sample tests cover the shown cases, not every valid input.</small></article>;
}
