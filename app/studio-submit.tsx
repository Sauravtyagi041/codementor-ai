"use client";
import {useRef,useState} from 'react';
import {useWorkspace,api} from './workspace-context';
import {judgeLanguages} from '@/lib/execution-languages';
export function StudioSubmit({problemId,code,language}:{problemId?:string;code:string;language:string}){
 const w=useWorkspace(),[busy,setBusy]=useState(false),[error,setError]=useState('');const lock=useRef(false);
 const supported=language==='JavaScript'||Object.hasOwn(judgeLanguages,language);
 const history=w.entries.filter(e=>e.kind==='submission'&&e.data.problemId===problemId);
 return <section className="surface spaced"><h3>Submit solution</h3><p>Server-selected test suite · separate from your editable custom tests. Accepted means this CodeMentor suite passed, not acceptance on another platform.</p><button type="button" disabled={busy||!problemId||!supported||!code.trim()} onClick={async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const result=await api('submit',{problemId,code,language});w.addEntry(result.entry);}catch(e){setError(e instanceof Error?e.message:'Submission failed.');}finally{lock.current=false;setBusy(false);}}}>{busy?'Judging solution…':'Submit to fixed tests'}</button>{!supported&&<p>This language supports Run tests only.</p>}{!problemId&&<p>Select a complete original exercise to submit.</p>}{error&&<p role="alert" className="error">{error}</p>}<div aria-live="polite">{history.slice(0,5).map(e=><p key={e.id}><strong>{e.data.verdict}</strong> · {e.data.passed}/{e.data.total} tests · {e.data.language} · {new Date(e.created).toLocaleString()}</p>)}</div></section>;
}
