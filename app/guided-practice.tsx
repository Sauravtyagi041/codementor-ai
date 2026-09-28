"use client";
import {useState} from "react";
import {guidedProblems,problemText,GuidedProblem} from "@/lib/guided-problems";
import {AnswerContent} from "./answer-content";
import {ProblemDescription} from "./problem-description";
import {Button} from "@/components/ui/button";
export function GuidedPractice({onOpen}:{onOpen?:(p:GuidedProblem,solution:boolean)=>void}){
 const [id,setId]=useState(guidedProblems[0].id),[hint,setHint]=useState(0),[step,setStep]=useState(0),[solution,setSolution]=useState(false);
 const [search,setSearch]=useState(""),[topic,setTopic]=useState("All topics"),[level,setLevel]=useState("All levels");
 const filtered=guidedProblems.filter(p=>(topic==="All topics"||p.topic===topic)&&(level==="All levels"||p.difficulty===level)&&((p.title+" "+p.topic).toLowerCase().includes(search.toLowerCase())));
 const p=guidedProblems.find(p=>p.id===id)!;
 function choose(id:string){setId(id);setHint(0);setStep(0);setSolution(false);}
 function open(solved:boolean){if(onOpen){onOpen(p,solved);return;}sessionStorage.setItem('codementor-selected-problem',JSON.stringify({id:p.id,solution:solved}));window.dispatchEvent(new CustomEvent('codementor-navigate',{detail:'Code studio'}));}
 return <section className="surface guided-practice"><div className="section-head"><h2>Learn → trace → code → practice</h2><span className="tag">Original guided exercises</span></div>
 <div className="problem-library-controls"><label className="field">Search {guidedProblems.length} problems<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Arrays, shortest paths, strings…"/></label><label className="field">Topic<select value={topic} onChange={e=>setTopic(e.target.value)}>{['All topics',...new Set(guidedProblems.map(p=>p.topic))].map(t=><option key={t}>{t}</option>)}</select></label><label className="field">Difficulty<select value={level} onChange={e=>setLevel(e.target.value)}>{['All levels','Easy','Medium'].map(t=><option key={t}>{t}</option>)}</select></label></div>
 <p>{filtered.length} of {guidedProblems.length} complete exercises · statements, examples, hints and worked solutions</p>
 <div className="problem-catalog">{filtered.map((item,i)=><button type="button" className="problem-catalog-row" aria-pressed={item.id===id} key={item.id} onClick={()=>choose(item.id)}><span>{i+1}. {item.title}</span><small>{item.topic} · {item.difficulty}</small></button>)}{!filtered.length&&<p>No matching problems. Try another topic or clear your search.</p>}</div>
 <ProblemDescription problem={p}/>
 <div className="actions"><Button type="button" onClick={()=>open(false)}>{onOpen?'Load starter into editor':'Practice in Code Studio'}</Button><Button type="button" variant="outline" disabled={hint>=p.hints.length} onClick={()=>setHint(h=>h+1)}>Reveal hint {Math.min(hint+1,p.hints.length)}</Button></div>
 {p.hints.slice(0,hint).map((h,i)=><p key={i}><strong>Hint {i+1}:</strong> {h}</p>)}
 <details><summary>Step-by-step dry run</summary><p>{p.steps[step]}</p><div className="actions"><Button type="button" variant="outline" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Previous</Button><span>{step+1} / {p.steps.length}</span><Button type="button" variant="outline" disabled={step===p.steps.length-1} onClick={()=>setStep(s=>s+1)}>Next step</Button></div></details>
 <details open={solution} onToggle={e=>setSolution(e.currentTarget.open)}><summary>Explain the solution and complexity</summary><AnswerContent text={'```javascript\n'+p.code+'\n```\n\n**Complexity:** '+p.cost+'\n\n**Common mistakes:** '+p.pitfalls}/><Button type="button" variant="outline" onClick={()=>open(true)}>Load worked solution into editor</Button></details>
 <h4>Practice a related pattern next</h4><div className="actions">{p.similar.map(id=>{const next=guidedProblems.find(p=>p.id===id)!;return <Button type="button" variant="outline" key={id} onClick={()=>choose(id)}>{next.title}</Button>;})}</div>
 <small>These are app-authored exercises with their own contracts, not copied platform statements or official judge submissions.</small>
 </section>;
}
