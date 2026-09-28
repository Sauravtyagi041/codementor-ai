"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useWorkspace, api } from "./workspace-context";
import { languages } from "@/lib/learning";
import { AnswerContent } from "./answer-content";
type Message = {role:"user"|"assistant";content:string};
export function FloatingMentor({page}: {page:string}) {
  const w=useWorkspace();
  const [open,setOpen]=useState(false),[text,setText]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const [messages,setMessages]=useState<Message[]>([]);
  const [language,setLanguage]=useState("JavaScript");
  const [style,setStyle]=useState('Hinglish'),[shareCode,setShareCode]=useState(false);
  const contextRef=useRef<{title:string;language:string;code:string;problem:string}|null>(null);
  const sending=useRef(false);
  useEffect(()=>{const receive=(e:Event)=>{contextRef.current=(e as CustomEvent).detail;};window.addEventListener('codementor-context',receive);return()=>window.removeEventListener('codementor-context',receive);},[]);
  const bottom=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(open)bottom.current?.scrollIntoView({block:"nearest"});},[messages,busy,open]);
  async function send(prompt?:string) {
    const question=(prompt||text).trim();if(!question||busy||sending.current)return;
    sending.current=true;contextRef.current=null;if(shareCode&&page==='Code studio')window.dispatchEvent(new Event('codementor-request-context'));
    const attached=contextRef.current as {title:string;language:string;code:string;problem:string}|null;
    setBusy(true);setError("");
    try {
      const response=await api("ai",{mode:"mentor",text:`The learner is on the ${page} page. Explanation preference: ${style}. Learner level: ${w.profile.level}. Question: ${question}\n${attached?'Attached current problem: '+attached.title+'\nStatement: '+attached.problem+'\nCode ('+attached.language+'):\n'+attached.code:'No editor code attached. Ask for code or error if needed.'}`,language:attached?.language||language,level:w.profile.level,history:messages.slice(-10).map(m=>({...m,content:m.content.slice(0,12000)}))});
      setMessages(old=>[...old,{role:"user",content:question},{role:"assistant",content:response.text}]);setText("");
    } catch(e){setError((e as Error).message);}finally{sending.current=false;setBusy(false);}
  }
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><button type="button" className="floating-mentor-button" aria-label="Open AI Mentor" title="Ask AI Mentor"><MessageCircle size={25}/><span>AI Mentor</span></button></PopoverTrigger>
    <PopoverContent side="top" align="end" sideOffset={12} className="floating-mentor-window" aria-label="AI Mentor chat" onInteractOutside={e=>e.preventDefault()}>
      <header className="floating-mentor-header"><div><strong>AI Mentor</strong><small>Here to help · {page}</small></div><Button type="button" variant="ghost" size="icon" aria-label="Clear mentor conversation" disabled={busy||!messages.length} onClick={()=>{setMessages([]);setError("");}}><Trash2 size={17}/></Button><Button type="button" variant="ghost" size="icon" aria-label="Minimize AI Mentor" onClick={()=>setOpen(false)}><X size={19}/></Button></header>
      <div className="floating-mentor-messages" role="log" aria-live="polite">
        {!messages.length&&<div className="floating-mentor-welcome"><MessageCircle size={28}/><h3>Stuck? Let's work through it.</h3><p>Concept, error ya approach—apna question pucho. Hint, dry run, debugging, complexity ya study plan—ek jagah.</p><small>Page ka naam share hota hai; editor code automatically nahi bheja jata.</small></div>}
        {messages.map((m,i)=><div className={`floating-mentor-message ${m.role}`} key={i}><small>{m.role==="user"?"You":"AI Mentor"}</small><AnswerContent text={m.content}/>{m.role==="assistant"&&<Button type="button" variant="ghost" onClick={()=>w.save("note","Mentor explanation",{text:m.content,source:"AI Mentor"}).catch(()=>setError("Could not save this note. Please retry."))}>Save to notes</Button>}</div>)}
        {busy&&<p role="status">Thinking…</p>}<div ref={bottom}/>
      </div>
      <form className="floating-mentor-compose" onSubmit={e=>{e.preventDefault();void send();}}>
        <details className="mentor-options"><summary>Options · {language} · {style}</summary><div className="mentor-option-fields"><label>Code language<select aria-label="Mentor code language" value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(l=><option key={l}>{l}</option>)}</select></label>
        <label>Explain in<select value={style} onChange={e=>setStyle(e.target.value)}>{['Hinglish','English','Hindi'].map(s=><option key={s}>{s}</option>)}</select></label>
        {page==='Code studio'&&<label className="mentor-share"><input type="checkbox" checked={shareCode} onChange={e=>setShareCode(e.target.checked)}/>Include current problem and code with my next message (uses editor language)</label>}
        <div className="mentor-quick-actions">{['Give me a small hint','Explain step by step','Help debug my code','Analyse time and space','Give me a practice plan'].map(q=><button key={q} type="button" disabled={busy} onClick={()=>setText(q)}>{q}</button>)}</div>
        </div></details>
        <textarea aria-label="Ask AI Mentor" placeholder="Ask a question or paste code…" rows={2} maxLength={12000} value={text} disabled={busy} onChange={e=>setText(e.target.value)}/>
        {error&&<p role="alert" className="error">{error}</p>}
        <div className="mentor-send-row"><small>{shareCode&&page==='Code studio'?'Current code included':'Code sharing off'}</small><Button type="submit" disabled={busy||!text.trim()}><Send size={16}/>{busy?"Thinking…":"Send"}</Button></div>
      </form>
    </PopoverContent>
  </Popover>;
}
