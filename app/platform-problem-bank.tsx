"use client";
import {useWorkspace} from "./workspace-context";
import {useEffect,useState} from 'react';
export type Problem={id:string;title:string;rating:number;tags:string[];url:string};
type Bank={updated:string;topics:{id:string;title:string;available:number;ids:string[]}[];problems:Record<string,Problem>};
export function PlatformProblemBank({onSelect}:{onSelect?:(problem:Problem)=>void}={}){
 const w=useWorkspace();const [band,setBand]=useState("all"),[onlySaved,setOnlySaved]=useState(false),[saving,setSaving]=useState("");
 const saved=new Set(w.entries.filter(e=>e.kind==='track'&&e.data.source==='Practice bank bookmark').map(e=>e.data.problemId));
 async function bookmark(p:Problem){if(saved.has(p.id)||saving)return;setSaving(p.id);try{await w.save('track',p.title,{source:'Practice bank bookmark',problemId:p.id,url:p.url,rating:p.rating,topics:p.tags});}catch{setError('Bookmark could not be saved. Refresh and retry.');}finally{setSaving('');}}
 const [bank,setBank]=useState<Bank|null>(null),[error,setError]=useState(''),[topic,setTopic]=useState('binary search'),[query,setQuery]=useState(''),[page,setPage]=useState(0);
 useEffect(()=>{const controller=new AbortController();fetch('/practice-bank.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Problem bank could not load. Refresh to retry.');return r.json();}).then(d=>setBank(d as Bank)).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();},[]);
 if(error)return <p role="alert">{error}</p>;if(!bank)return <p role="status">Loading topic practice bank…</p>;
 const selected=bank.topics.find(t=>t.id===topic)||bank.topics[0];
 const rows=selected.ids.map(id=>bank.problems[id]).filter(p=>(p.title+' '+p.tags.join(' ')).toLowerCase().includes(query.toLowerCase())&&(!onlySaved||saved.has(p.id))&&(band==='all'||band==='foundation'&&p.rating<=1200||band==='intermediate'&&p.rating>=1300&&p.rating<=1900||band==='advanced'&&p.rating>=2000));
 return <section className="platform-bank"><h2>100 problems per topic</h2><p>{bank.topics.length} topics · {Object.keys(bank.problems).length.toLocaleString()} unique Codeforces problems. Each topic has 100 distinct entries, ordered by official rating. A problem may belong to multiple topics.</p>
 <p><strong>External practice:</strong> full statements, official tests and submission are on Codeforces. Choose a problem to open its official statement and judge.</p>
 <label className="field">Topic<select value={selected.id} onChange={e=>{setTopic(e.target.value);setPage(0);}}>{bank.topics.map(t=><option key={t.id} value={t.id}>{t.title} · 100 problems</option>)}</select></label>
 <label className="field">Search title or concept<input value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} placeholder="Search within this topic"/></label>
 <div className="bank-filters"><label className="field">Rating range<select value={band} onChange={e=>{setBand(e.target.value);setPage(0);}}><option value="all">All ratings · increasing</option><option value="foundation">800–1200</option><option value="intermediate">1300–1900</option><option value="advanced">2000+</option></select></label><label><input type="checkbox" checked={onlySaved} onChange={e=>{setOnlySaved(e.target.checked);setPage(0);}}/> Saved for later</label></div><p>{rows.length} matching problems</p>
 <p>Start at the top and move toward higher ratings. Some advanced topics begin above beginner level. Official tags describe related concepts; 100 entries do not guarantee every possible variation.</p>
 <div className="problem-catalog">{rows.slice(page*20,(page+1)*20).map((p,i)=><div className="bank-problem-row" key={p.id}><a className="problem-catalog-row" href={p.url} target="_blank" rel="noopener noreferrer"><span>{page*20+i+1}. {p.title}</span><small>Rating {p.rating} · {p.tags.join(' · ')} ↗</small></a><button type="button" onClick={()=>onSelect?onSelect(p):window.open(p.url,'_blank','noopener,noreferrer')}>{onSelect?'Select':'Open'}</button><button type="button" aria-label={'Save '+p.title+' for later'} disabled={saved.has(p.id)||!!saving} onClick={()=>void bookmark(p)}>{saved.has(p.id)?'Saved ✓':saving===p.id?'Saving…':'Save'}</button></div>)}</div>
 {!rows.length&&<p>No matching problems. Clear your search.</p>}
 <div className="actions"><button type="button" disabled={!page} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page+1} / {Math.max(1,Math.ceil(rows.length/20))}</span><button type="button" disabled={(page+1)*20>=rows.length} onClick={()=>setPage(p=>p+1)}>Next 20</button></div><small>Source: official Codeforces problemset API · snapshot {new Date(bank.updated).toLocaleDateString()}.</small>
 </section>;
}
