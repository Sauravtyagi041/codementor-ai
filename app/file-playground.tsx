"use client";
import { useState, useEffect } from 'react';
import { AnswerContent } from './answer-content';
import { Button } from '@/components/ui/button';
export function FilePlayground({code,language}:{code:string;language:string}) {
 const [document,setDocument]=useState(''),[error,setError]=useState(''),[source,setSource]=useState('');
 async function preview(){setError('');setSource(code);try{
  if(language==='JSON') setDocument(JSON.stringify(JSON.parse(code),null,2));
  else if(language==='YAML'){const prettier=await import('prettier/standalone');const yaml=await import('prettier/plugins/yaml');setDocument(await prettier.format(code,{parser:'yaml',plugins:[yaml]}));}
  else setDocument(code);
 }catch(e){setDocument('');setError(e instanceof Error?e.message:'Invalid document');}}
 useEffect(()=>{const handler=()=>void preview();window.addEventListener('codementor-run-tests',handler);return()=>window.removeEventListener('codementor-run-tests',handler);});
 const csp='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:;">';
 return <section className="surface spaced"><h3>{language} playground</h3><p>{['HTML','CSS'].includes(language)?'Preview is isolated; scripts and network requests are disabled. CSS applies to the sample page below.':['JSON','YAML'].includes(language)?'Validate syntax and view formatted data.':'Preview your document.'}</p>
 <Button onClick={()=>void preview()}>{['JSON','YAML'].includes(language)?'Validate document':'Preview document'}</Button>
 {source!==code&&source&&<p>Document changed. Refresh the preview.</p>}
 {error&&<pre className="error">{error}</pre>}
 {!error&&document&&(language==='HTML'||language==='CSS'?<iframe title={`${language} preview`} sandbox="" style={{width:'100%',height:350,background:'white',border:'1px solid #ddd'}} srcDoc={csp+(language==='CSS'?'<style>'+document.replace(/<\/style/gi,'')+'</style><main><h1>Hello, CodeMentor!</h1><p>Style this sample page.</p><button>Sample button</button><ul><li>First item</li><li>Second item</li></ul></main>':document)}/>:language==='Markdown'?<AnswerContent text={document}/>:<pre style={{whiteSpace:'pre-wrap'}}>{document}</pre>)}
 </section>;
}
