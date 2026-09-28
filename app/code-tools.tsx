"use client";
import {parseOriginalExercise} from "@/lib/original-exercise";
import { TopicPracticeLibrary, type Question } from "./topic-practice-library";
import {StudioSubmit} from "./studio-submit";
import { StudioStopwatch } from "./studio-stopwatch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { useState, useEffect, useRef } from "react";
import { ApproachLab } from "./approach-lab";
import { BrowserRunner } from "./browser-runner";
import { FilePlayground } from './file-playground';
import { previewLanguages, canExecute } from '@/lib/execution-languages';
import { StudioProblemPicker } from "./studio-problem-picker";
import { PlatformProblemBank, type Problem } from "./platform-problem-bank";
import { ProblemDescription } from "./problem-description";
import { guidedProblems, problemText, GuidedProblem, runnableCode } from "@/lib/guided-problems";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Code2,
  Sparkles,
  BrainCircuit,
  ArrowRight,
  Terminal,
  Save,
  LoaderCircle,
  Upload,
  ScanText,
} from "lucide-react";
import { languages, staticReview, lessons } from "@/lib/learning";
import { languageConfigs, languageFromFilename } from "@/lib/languages";
import { api, useWorkspace } from "./workspace-context";
import {
  Choice,
  Field,
  Heading,
  Result,
  DeleteEntry,
  VoiceInput,
  AIBox,
  download,
} from "./ui-kit";
const sample = `function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) {\n        return [i, j];\n      }\n    }\n  }\n  return [];\n}`;
export function CodeStudio() {
  const w = useWorkspace();
  const problemDrafts=useRef<Record<string,{code:string;language:string;drafts?:Record<string,string>}>>({});
  const languageDrafts=useRef<Record<string,string>>({});
  const [problemView,setProblemView]=useState("description");
  const [listOpen,setListOpen]=useState(false);
  const [analysisOpen,setAnalysisOpen]=useState(false),[descriptionOpen,setDescriptionOpen]=useState(false);
  const [libraryTab,setLibraryTab]=useState("guided");
  const [originalProblem,setOriginalProblem]=useState<GuidedProblem|null>(null);
  const [generating,setGenerating]=useState(false);
  const generationId=useRef(0);
  const operationId=useRef(0);
  const latestEditor=useRef({code:"",language:"",context:""});
  const [focusMode,setFocusMode]=useState(false),[fontSize,setFontSize]=useState(14),[split,setSplit]=useState(43);
  const [code, setCode] = useState(runnableCode(guidedProblems[0],false)),
    [language, setLanguage] = useState("JavaScript"),
    [previousCode, setPreviousCode] = useState<string | null>(null),
    [title, setTitle] = useState(guidedProblems[0].title),
    [context, setContext] = useState(
      problemText(guidedProblems[0]),
    ),
    [result, setResult] = useState(""),
    [source, setSource] = useState(""),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [hint, setHint] = useState(0),
    [ocr, setOcr] = useState("");
  useEffect(() => {
    try {
      const savedDrafts=sessionStorage.getItem("codementor-problem-drafts");
      if(savedDrafts)problemDrafts.current=JSON.parse(savedDrafts);
      const selected=sessionStorage.getItem("codementor-selected-problem");
      if(selected){const choice=JSON.parse(selected);const p=guidedProblems.find(p=>p.id===choice.id);if(p){loadProblem(p,choice.solution);sessionStorage.removeItem("codementor-selected-problem");return;}}
      const draft = sessionStorage.getItem("codementor-code-draft");
      if (draft) {
        const d = JSON.parse(draft);
        if(d.originalProblem){try{const parsed=parseOriginalExercise(JSON.stringify(d.originalProblem));setOriginalProblem({...parsed,id:d.originalProblem.id,tests:parsed.examples.map(e=>({input:e.input,expected:e.output})),similar:[]});}catch{}}
        const restored=guidedProblems.find(p=>problemText(p)===d.context);
        languageDrafts.current=(restored?problemDrafts.current[restored.id]?.drafts:undefined)||{};
        setCode(d.code);
        setLanguage(d.language);
        setTitle(d.title);
        if (typeof d.context === "string") setContext(d.context === "Find indices of two numbers adding to target." ? problemText(guidedProblems[0]) : d.context);
      }
    } catch {}
  }, []);
  useEffect(() => {
    const timer=setTimeout(()=>{try{
      const current=originalProblem&&problemText(originalProblem)===context?originalProblem:guidedProblems.find(p=>problemText(p)===context);
      if(current){problemDrafts.current[current.id]={code,language,drafts:{...languageDrafts.current,[language]:code}};sessionStorage.setItem("codementor-problem-drafts",JSON.stringify(problemDrafts.current));}
      sessionStorage.setItem(
      "codementor-code-draft",
      JSON.stringify({ code, language, title, context, originalProblem }),
    );}catch{}},350);
    return ()=>clearTimeout(timer);
  }, [code, language, title, context, originalProblem]);
  latestEditor.current={code,language,context};
  function loadProblem(p:GuidedProblem, solution:boolean){
    operationId.current++;setBusy("");
    generationId.current++;setGenerating(false);setOriginalProblem(p.id.startsWith("original:")?p:null);
    const current=originalProblem&&problemText(originalProblem)===context?originalProblem:guidedProblems.find(item=>problemText(item)===context);
    if(current)problemDrafts.current[current.id]={code,language,drafts:{...languageDrafts.current,[language]:code}};
    const saved=!solution?problemDrafts.current[p.id]:undefined;
    languageDrafts.current=saved?.drafts||{};setProblemView('description');setPreviousCode(code);setTitle(p.title);setContext(problemText(p));setLanguage(saved?.language||'JavaScript');setCode(saved?.code??runnableCode(p,solution));setResult('');setHint(0);setError('');
  }
  async function chooseLibraryQuestion(p:Question){
    const requestId=++generationId.current;setGenerating(true);setError('');setListOpen(false);
    try{
      const cached=w.entries.find(e=>e.kind==='note'&&e.data.source==='Original practice exercise'&&e.data.referenceUrl===p.url);
      let exercise;
      if(cached){exercise=parseOriginalExercise(JSON.stringify(cached.data.exercise));}
      else{const response=await api('ai',{mode:'original_exercise',language:'JavaScript',level:w.profile.level,text:JSON.stringify({topics:p.topics,difficulty:p.level,instruction:'Write a new original exercise for these concepts. Full statement and consistent examples required.'})});exercise=parseOriginalExercise(response.text);}
      if(requestId!==generationId.current)return;
      const full:GuidedProblem={...exercise,id:'original:'+p.url,tests:exercise.examples.map(e=>({input:e.input,expected:e.output})),similar:[]};
      loadProblem(full,false);
      if(!cached)try{await w.save('note',exercise.title,{source:'Original practice exercise',referenceUrl:p.url,exercise,text:problemText(full)});}catch{w.setNotice('Exercise opened, but could not save it to your account.');}
    }catch(e){if(requestId===generationId.current)setError(e instanceof Error?e.message:'Could not create a complete exercise. Your previous question is unchanged.');}
    finally{if(requestId===generationId.current)setGenerating(false);}
  }
  function selectExternal(p:Problem){w.setNotice("Selected question changed. Your editor code has been retained; adapt it for this problem.");setTitle(p.title);setContext(`${p.title}\n\nCodeforces · Rating ${p.rating}\nTopics: ${p.tags.join(', ')}\n\nOfficial statement: ${p.url}\n\nThe full statement and examples are available on the official page. They have not been imported into this workspace.`);setResult("");setError("");setProblemView("description");}
  const externalUrl=context.match(/Official statement: (https:\/\/(?:codeforces\.com|leetcode\.com)\/[^\s]+)/)?.[1];
  const activeProblem=originalProblem&&problemText(originalProblem)===context?originalProblem:guidedProblems.find(p=>problemText(p)===context);
  useEffect(()=>{const share=()=>window.dispatchEvent(new CustomEvent('codementor-context',{detail:{title,language,code:code.slice(0,18000),problem:context.slice(0,12000)}}));window.addEventListener('codementor-request-context',share);return()=>window.removeEventListener('codementor-request-context',share);},[title,language,code,context]);
  useEffect(()=>{if(result)setAnalysisOpen(true);},[result]);
  async function run(mode: string) {
    const operation=++operationId.current;const snapshot=JSON.stringify({code,language,context});
    setBusy(mode);
    setError("");
    try {
      const d = await api("ai", {
        mode,
        language,
        level: w.profile.level,
        text: `Problem / observed failure:\n${context}\nCode:\n${code}\n${mode === "hint" ? `Hint stage ${hint + 1}. Previous hint: ${result}` : ""}`,
      });
      if(operation!==operationId.current||snapshot!==JSON.stringify(latestEditor.current))return;
      setResult(d.text);
      setSource(d.source);
      if (mode === "hint") setHint((h) => h + 1);
      if (mode === "format") {
        const clean = d.text
          .replace(/^```[^\n]*\n/, "")
          .replace(/\n```\s*$/, "");
        setCode(clean);
      }
    } catch (e) {
      if(operation===operationId.current)setError((e as Error).message);
    } finally {
      if(operation===operationId.current)setBusy("");
    }
  }
  async function format() {
    const config = languageConfigs.find((item) => item.name === language);
    if (!config?.parser) {
      setError("Local formatting is not available for "+language+". Your code has not been changed.");
      return;
    }
    const operation=++operationId.current;const snapshot=JSON.stringify({code,language,context});
    setBusy("format");
    setError("");
    try {
      const prettier = await import("prettier/standalone");
      const babel = await import("prettier/plugins/babel");
      const estree = await import("prettier/plugins/estree");
      const normalize = (module: any) => module.default || module;
      const plugins: any[] = [normalize(babel), normalize(estree)];
      if (config.parser === "typescript")
        plugins.push(await import("prettier/plugins/typescript"));
      if (config.parser === "html")
        plugins.push(await import("prettier/plugins/html"));
      if (config.parser === "css")
        plugins.push(await import("prettier/plugins/postcss"));
      if (config.parser === "yaml")
        plugins.push(await import("prettier/plugins/yaml"));
      if (config.parser === "markdown")
        plugins.push(await import("prettier/plugins/markdown"));
      const formatted = await prettier.format(code, {
          parser: config.parser,
          plugins: plugins.map(normalize),
          singleQuote: true,
        });
      if(operation!==operationId.current||snapshot!==JSON.stringify(latestEditor.current))return;
      setPreviousCode(code);setCode(formatted);
      w.setNotice(`${language} formatted locally.`);
    } catch (e) {
      if(operation===operationId.current)setError("Formatting failed: " + (e as Error).message);
    } finally {
      if(operation===operationId.current)setBusy("");
    }
  }
  async function importImage(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError("Choose a PNG, JPG or WebP image under 10 MB.");
      return;
    }
    setBusy("ocr");
    setError("");
    let worker: any;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("eng", 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text")
            setOcr(`${Math.round(m.progress * 100)}%`);
        },
      });
      const d = await worker.recognize(file);
      setContext(d.data.text);
      setOcr("Question text imported. Check it before asking your mentor.");
      w.setNotice("Image text added to problem context.");
    } catch {
      setError(
        "OCR could not load or read the image. It needs internet for its language model. Try a clearer photo or type the question.",
      );
    } finally {
      if (worker) await worker.terminate();
      setBusy("");
    }
  }
  return (
    <div onKeyDown={e=>{if(e.key==='Escape')setFocusMode(false);}} className={`lc-studio ${focusMode?'studio-focus':''}`} style={{'--problem-width':split+'%'} as import("react").CSSProperties}>
      <header className="lc-toolbar"><div><Code2 size={19}/><strong>Code Studio</strong><span className="lc-muted">Write · test · understand</span></div><div className="studio-toolbar-actions"><StudioStopwatch key={activeProblem?.id||"scratch"} problemId={activeProblem?.id||"scratch"}/><button type="button" aria-pressed={focusMode} onClick={()=>setFocusMode(v=>!v)}>{focusMode?'Exit focus':'Focus mode'}</button><button type="button" disabled={!!busy} onClick={format}>Format</button><button type="button" disabled={!code.trim()||(!canExecute(language)&&!previewLanguages.includes(language))} onClick={()=>{document.getElementById('studio-console')?.scrollIntoView({block:'nearest'});window.dispatchEvent(new Event('codementor-run-tests'));}} className="lc-run-link">▶ {previewLanguages.includes(language)?'Preview':'Run tests'} <kbd>Ctrl ↵</kbd></button></div></header>
      {error&&<div className="studio-error-banner" role="alert"><span>{error}</span><button type="button" onClick={()=>setError('')} aria-label="Dismiss error">×</button></div>}
      {busy&&<p className="studio-task-status" role="status">{busy==='format'?'Formatting your code…':busy==='ocr'?'Reading image…':'Preparing '+busy+'…'}</p>}
      {result&&<button type="button" className="studio-reopen-analysis" onClick={()=>setAnalysisOpen(true)}>Open latest analysis ↗</button>}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}><DialogContent className="studio-reading-dialog"><DialogHeader><DialogTitle>Code analysis</DialogTitle><DialogDescription>Review the result without leaving your editor.</DialogDescription></DialogHeader><div className="studio-reading-body">{result?<Result text={result} label={source}/>:<p>No analysis yet.</p>}</div></DialogContent></Dialog>
      <Dialog open={descriptionOpen} onOpenChange={setDescriptionOpen}><DialogContent className="studio-reading-dialog"><DialogHeader><DialogTitle>{activeProblem?.title||'Problem description'}</DialogTitle><DialogDescription>Statement, examples, constraints and hints.</DialogDescription></DialogHeader><div className="studio-reading-body">{activeProblem&&<ProblemDescription problem={activeProblem}/>}</div></DialogContent></Dialog>
      <details className="studio-display-settings"><summary>Display settings & keyboard shortcuts</summary><div className="studio-preferences"><label>Problem pane <input aria-label="Problem pane width" type="range" min="30" max="60" value={split} onChange={e=>setSplit(Number(e.target.value))}/></label><label>Font size <select aria-label="Editor font size" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}>{[12,14,16,18,20].map(n=><option key={n} value={n}>{n}px</option>)}</select></label><span>Ctrl+Enter: run · Ctrl+Shift+F: format · Tab: indent</span></div></details>
      <p className="studio-start-guide">1. Choose a problem → 2. Read examples and implement solve → 3. Run sample tests. Stuck? Open a hint or the floating mentor.</p>
      <div className="editor-layout studio-workspace">
        <Dialog open={listOpen} onOpenChange={setListOpen}><DialogContent className="studio-problem-drawer"><DialogHeader><DialogTitle>Choose a problem</DialogTitle><DialogDescription>Choose a complete exercise, or create a new original exercise from a platform question’s topics.</DialogDescription></DialogHeader><div className="studio-library-tabs"><button type="button" aria-pressed={libraryTab==='all'} onClick={()=>setLibraryTab('all')}>All platform questions</button><button type="button" aria-pressed={libraryTab==='guided'} onClick={()=>setLibraryTab('guided')}>Complete in-app exercises</button></div><div className="studio-library-scroll">{libraryTab==='all'?<TopicPracticeLibrary onChoose={chooseLibraryQuestion}/>:<StudioProblemPicker activeId={activeProblem?.id} onChoose={p=>{loadProblem(p,false);setListOpen(false);}}/>}</div></DialogContent></Dialog>
        <section className="surface studio-problem">
          <div className="studio-problem-bar"><button type="button" className="studio-open-problems" aria-haspopup="dialog" aria-expanded={listOpen} onClick={()=>setListOpen(true)}>☰ Choose problem <span>Browse questions →</span></button></div>
          <div className="lc-tabs"><button type="button" onClick={()=>setDescriptionOpen(true)} disabled={!activeProblem}>Expand description ↗</button><button type="button" aria-pressed={problemView==='description'} onClick={()=>setProblemView('description')}>Description</button></div>
          <div className="lc-problem-content" key={activeProblem?.id||externalUrl||'custom'}>
          {generating&&<p role="status">Writing a complete original exercise with examples and constraints… <button onClick={()=>{generationId.current++;setGenerating(false);}}>Cancel</button></p>}
          {originalProblem&&activeProblem&&<p className="original-exercise-notice">AI-generated original practice exercise. This is a new question for the selected concepts, not the external platform question. Expected outputs and solution are not independently verified.</p>}
          {problemView==='platform'?<StudioProblemPicker initialTopic={activeProblem?.topic} onChoose={p=>loadProblem(p,false)}/>:activeProblem?<><div className="studio-question-nav"><span>{activeProblem.topic}</span>{[-1,1].map(step=>{const sequence=guidedProblems.filter(p=>p.topic===activeProblem.topic).sort((a,b)=>({Easy:0,Medium:1,Hard:2}[a.difficulty||'Easy'])-({Easy:0,Medium:1,Hard:2}[b.difficulty||'Easy']));const next=sequence[sequence.findIndex(p=>p.id===activeProblem.id)+step];return <button key={step} disabled={!next} onClick={()=>next&&loadProblem(next,false)}>{step<0?'← Previous':'Next →'}</button>;})}</div><ProblemDescription problem={activeProblem}/><details className="studio-solution"><summary>Worked solution & complexity</summary><pre><code>{activeProblem.code}</code></pre><p>{activeProblem.cost}</p><p>{activeProblem.pitfalls}</p><button type="button" onClick={()=>loadProblem(activeProblem,true)}>Load worked JavaScript solution</button></details><details className="studio-related"><summary>More practice in this topic</summary><div className="actions">{guidedProblems.filter(p=>p.topic===activeProblem.topic&&p.id!==activeProblem.id).sort((a,b)=>({Easy:0,Medium:1,Hard:2}[a.difficulty||'Easy'])-({Easy:0,Medium:1,Hard:2}[b.difficulty||'Easy'])).slice(0,3).map(item=>{const id=item.id;const next=item;return next?<button type="button" key={id} onClick={()=>loadProblem(next,false)}>Practice next: {next.title}</button>:null;})}</div></details></>:<><h2>{title||'Untitled problem'}</h2><span className="lc-topic">Practice · {language}</span><button type="button" className="lc-run-link" onClick={()=>setProblemView('platform')}>Choose another problem</button>{externalUrl&&<p><a href={externalUrl} target="_blank" rel="noopener noreferrer">Read full official statement ↗</a></p>}<div className="lc-statement">{context||'Choose a problem from the Problems tab, or paste one in Edit statement.'}</div></>}
          </div>
        </section>
        <div className="lc-right"><section className="editor-panel">
          <div className="editor-bar">
            <input
              aria-label="Solution title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
            />
            <Choice
              label="Language"
              value={language}
              options={languages}
              onChange={(target) => {
                if(target===language||busy)return;
                languageDrafts.current[language]=code;
                setPreviousCode(code);
                setLanguage(target);
                setCode(languageDrafts.current[target] ?? (target==='JavaScript'&&activeProblem?runnableCode(activeProblem,false):languageConfigs.find(c=>c.name===target)?.template||''));
                setResult('');setError('');
                w.setNotice('Language switched. Each language keeps its code while this editor is open. Implement the problem using the input contract shown in Description.');
              }}
            />
          </div>
          <div className="code-area">
            <div className="line-numbers" style={{fontSize,lineHeight:Math.round(fontSize*1.7)+'px'}}>
              {code.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              aria-label="Code editor"
              style={{fontSize,lineHeight:Math.round(fontSize*1.7)+'px'}}
              disabled={busy === "translate" || busy === "format"}
              wrap="off"
              onScroll={e=>{const gutter=e.currentTarget.previousElementSibling;if(gutter)gutter.scrollTop=e.currentTarget.scrollTop;}}
              onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();window.dispatchEvent(new Event('codementor-run-tests'));return;}if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();if(!busy)void format();return;}if(e.key==='Tab'){e.preventDefault();const el=e.currentTarget;const start=el.selectionStart,end=el.selectionEnd;setCode(code.slice(0,start)+'  '+code.slice(end));requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=start+2;});}}}
              spellCheck={false}
              value={code}
              maxLength={50000}
              onChange={(e) => {
                setCode(e.target.value);
                setHint(0);
              }}
            />
          </div>
          <div className="editor-bottom">
            <span>
              <Terminal size={14} />
              Multi-language test console available below
            </span>
            <span>{code.split("\n").length} lines</span>
          </div>
          <div className="editor-actions">
            <Button variant="outline" disabled={!!busy} onClick={format}>
              Format
            </Button>
            <Button
              variant="outline"
              disabled={!!busy}
              onClick={() => run("complexity")}
            >
              Time & space complexity
            </Button>
            <Button
              disabled={!!busy || !code.trim()}
              onClick={() => run("review")}
            >
              {busy === "review" ? (
                <LoaderCircle className="spin" />
              ) : (
                <Sparkles />
              )}
              Review code <ArrowRight />
            </Button>
          </div>
        </section>
        <div id="studio-console" className="lc-console">{previewLanguages.includes(language) ? <FilePlayground key={language} code={code} language={language}/> : <BrowserRunner code={code} language={language} title={title} context={context} seededTests={activeProblem?.tests} problemId={activeProblem?.id} key={(activeProblem?.id||externalUrl||'custom')+':'+language} />}</div></div>
        <details className="surface spaced" style={{gridColumn:'1 / -1'}}>
          <summary>Code tools: hints, static checks and debugging</summary>
          <div className="actions">
            <Button variant="outline" onClick={()=>{setResult(staticReview(code,language));setSource('Static pattern checks');setError('');}}>Run static checks</Button>
            {[["hint", "Next hint"], ["debug", "Debug code"], ["tests", "Generate tests"], ["pseudocode", "Flowchart & pseudocode"]].map(([mode,label])=><Button key={mode} variant="outline" disabled={!!busy} onClick={()=>run(mode)}>{label}</Button>)}
          </div>
        </details>
      </div>

      <StudioSubmit key={activeProblem?.id||"custom"} problemId={activeProblem&&!activeProblem.id.startsWith("original:")?activeProblem.id:undefined} code={code} language={language}/>
      <ApproachLab code={code} language={language} context={context} />
      <section className="surface spaced">

        <div className="actions">
          <Button
            variant="outline"
            onClick={() =>
              w
                .save("snippet", title || "Untitled solution", {
                  code,
                  language,
                  context,
                  review: result,
                  source,
                })
                .catch((e) => setError(e.message))
            }
          >
            <Save />
            Save solution & review
          </Button>
          <label className="upload-button">
            <Upload size={16} />
            Import code
            <input
              type="file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f && f.size <= 50000) {
                  setPreviousCode(code);
                  setCode(await f.text());
                  setLanguage(languageFromFilename(f.name));
                  setTitle(f.name);
                  setError("");
                } else setError("Choose a code file under 50 KB.");
                e.target.value = "";
              }}
            />
          </label>
          <Button
            variant="outline"
            onClick={() => {
              setPreviousCode(code);
              setCode(
                language==='JavaScript'&&activeProblem?runnableCode(activeProblem,false):languageConfigs.find((item) => item.name === language)
                  ?.template || "",
              );
            }}
          >
            Insert starter code
          </Button>
          <Button
            variant="outline"
            disabled={previousCode === null}
            onClick={() => {
              if (previousCode !== null) {
                setCode(previousCode);
                setPreviousCode(null);
              }
            }}
          >
            Restore previous code
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              download(
                `${(title || "solution").replace(/[^a-zA-Z0-9_-]/g, "_")}.${languageConfigs.find((item) => item.name === language)?.extension || "txt"}`,
                code,
              )
            }
          >
            Download source
          </Button>
          <label className="upload-button">
            <ScanText size={16} />
            {busy === "ocr" ? `Reading image ${ocr}` : "Question from image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={!!busy}
              onChange={(e) => {
                void importImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="fine-print">
          OCR processes the image in your browser. Printed English works best;
          handwriting may need corrections.
        </p>
      </section>

      <section className="surface spaced">
        <h3>Saved solutions</h3>
        {w.entries.filter((e) => e.kind === "snippet").length === 0 ? (
          <p>Your saved code and reviews will appear here.</p>
        ) : (
          w.entries
            .filter((e) => e.kind === "snippet")
            .map((e) => (
              <div className="list-row" key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <small>
                    {e.data.language} ·{" "}
                    {new Date(e.created).toLocaleDateString()}
                  </small>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCode(e.data.code || "");
                    setContext(e.data.context || "");
                    setLanguage(e.data.language || "JavaScript");
                    setTitle(e.title);
                    setResult(e.data.review || "");
                    setSource(e.data.source || "Saved result");
                  }}
                >
                  Open
                </Button>
                <DeleteEntry id={e.id} />
              </div>
            ))
        )}
      </section>
    </div>
  );
}
export function Mentor() {
  const w = useWorkspace();
  const [text, setText] = useState(""),
    [messages, setMessages] = useState<
      { role: "user" | "assistant"; content: string }[]
    >([]),
    [mode, setMode] = useState("hint"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [search, setSearch] = useState("");
  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const d = await api("ai", {
        mode,
        text,
        history: messages.slice(-10),
        level: w.profile.level,
      });
      const next = [
        ...messages,
        { role: "user" as const, content: text },
        { role: "assistant" as const, content: d.text },
      ];
      setMessages(next);
      setText("");
      await w.save("chat", text.slice(0, 100), { messages: next.slice(-12) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Think it through."
        description="A mentor that meets you where you are, plus a handbook you can use anytime."
      />
      <div className="two-col">
        <section className="surface">
          <div className="section-head">
            <h3>Mentor conversation</h3>
            <span className="tag">{w.profile.level}</span>
          </div>
          <Choice
            label="Teaching mode"
            value={mode}
            options={["hint", "explain", "debug", "roadmap"]}
            onChange={setMode}
          />
          <div className="chat-log">
            {messages.length === 0 ? (
              <p>
                Describe what you tried and where you are stuck. Hints guide you
                without immediately giving away the solution.
              </p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`chat-message ${m.role}`}>
                  <strong>{m.role === "user" ? "You" : "Mentor"}</strong>
                  <Result
                    text={m.content}
                    label={
                      m.role === "assistant" ? "AI generated" : "Your question"
                    }
                  />
                </div>
              ))
            )}
          </div>
          <Field label="Your question">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Why does lower_bound return end() here?"
            />
          </Field>
          <div className="actions">
            <Button disabled={busy || !text.trim()} onClick={send}>
              {busy ? "Thinking…" : "Ask mentor"}
              <ArrowRight />
            </Button>
            <VoiceInput onText={setText} />
            <Button variant="ghost" onClick={() => setMessages([])}>
              New conversation
            </Button>
          </div>
          {error && <p className="error">{error}</p>}
        </section>
        <section className="surface">
          <h3>STL & language handbook</h3>
          <Field label="Search concepts">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="lower_bound, BFS, map…"
            />
          </Field>
          {lessons
            .filter((l) =>
              (l.title + " " + l.topic)
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((l) => (
              <details className="lesson" key={l.title}>
                <summary>
                  {l.title}
                  <span className="tag">{l.topic}</span>
                </summary>
                <pre>{l.body}</pre>
              </details>
            ))}
        </section>
      </div>
      <section className="surface spaced">
        <h3>Previous conversations</h3>
        {w.entries
          .filter((e) => e.kind === "chat")
          .slice(0, 10)
          .map((e) => (
            <div className="list-row" key={e.id}>
              <strong>{e.title}</strong>
              <Button
                variant="outline"
                onClick={() => setMessages(e.data.messages || [])}
              >
                Continue
              </Button>
              <DeleteEntry id={e.id} />
            </div>
          ))}
      </section>
    </>
  );
}
