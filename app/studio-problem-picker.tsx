"use client";
import {useState} from 'react';
import {useWorkspace} from './workspace-context';
import {guidedProblems,type GuidedProblem} from '@/lib/guided-problems';
export function StudioProblemPicker({onChoose,initialTopic='All topics',activeId}:{onChoose:(p:GuidedProblem)=>void;initialTopic?:string;activeId?:string}){
 const [query,setQuery]=useState(''),[topic,setTopic]=useState(initialTopic),[level,setLevel]=useState('All levels');
 const {entries}=useWorkspace();
 const solved=new Set(entries.filter(e=>e.kind==='submission'&&e.data.verdict==='Accepted').map(e=>e.data.problemId));
 const ranks={Easy:0,Medium:1,Hard:2};
 const rows=guidedProblems.filter(p=>(topic==='All topics'||p.topic===topic)&&(level==='All levels'||p.difficulty===level)&&(p.title+' '+p.topic).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>ranks[a.difficulty||'Easy']-ranks[b.difficulty||'Easy']);
 return <section className="studio-catalog"><h3>Problem list <small>{rows.length}</small></h3><input aria-label="Search problems" placeholder="Search questions or concepts…" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Filter topic" value={topic} onChange={e=>setTopic(e.target.value)}><option>All topics</option>{[...new Set(guidedProblems.map(p=>p.topic))].sort().map(t=><option key={t}>{t}</option>)}</select><select aria-label="Filter difficulty" value={level} onChange={e=>setLevel(e.target.value)}>{['All levels','Easy','Medium','Hard'].map(l=><option key={l}>{l}</option>)}</select><p>Complete statements and runnable sample tests. Easy → Hard.</p><div className="studio-catalog-list">{rows.map((p,i)=><button key={p.id} aria-current={p.id===activeId?'true':undefined} onClick={()=>onChoose(p)}><span className="catalog-number">{i+1}</span><span><strong>{p.title}</strong><small>{p.topic}{solved.has(p.id)?' · ✓ Accepted':''}{p.id===activeId?' · Currently open':''}</small></span><em className={'difficulty-'+p.difficulty?.toLowerCase()}>{p.difficulty}</em></button>)}{!rows.length&&<div className="catalog-empty"><p>No matching questions.</p><button type="button" onClick={()=>{setQuery('');setTopic('All topics');setLevel('All levels');}}>Clear filters</button></div>}</div><a href="#Practice%20%26%20quizzes">Browse external platform collections ↗</a></section>;
}
