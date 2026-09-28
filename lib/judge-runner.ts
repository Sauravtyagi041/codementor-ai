import { HttpError } from './server';
type Submission = {token?:string; stdout?:string|null; stderr?:string|null; compile_output?:string|null; status?:{id:number;description:string}};
export async function runJudge(languageId:number, code:string, input:string, signal:AbortSignal) {
  const start=Date.now();
  const bounded=AbortSignal.any([signal,AbortSignal.timeout(45000)]);
  async function request(path:string, init:RequestInit={}):Promise<Submission> {
    const response=await fetch('https://ce.judge0.com'+path,{...init,signal:bounded,headers:{'Content-Type':'application/json'}});
    if(!response.ok) throw new HttpError(response.status===429?429:503,'Compiler service is unavailable or busy. Please retry later.');
    return await response.json() as Submission;
  }
  try {
    let data=await request('/submissions?wait=true',{method:'POST',body:JSON.stringify({language_id:languageId,source_code:code,stdin:input,cpu_time_limit:3,wall_time_limit:10,enable_network:false,max_file_size:64})});
    while(!data.status || data.status.id<=2) {
      if(!data.token || !/^[a-zA-Z0-9-]+$/.test(data.token)) throw new HttpError(503,'Compiler returned an invalid job. Retry your test.');
      const token=data.token;
      await new Promise(resolve=>setTimeout(resolve,750));
      data=await request('/submissions/'+encodeURIComponent(token));
    }
    const output=data.stdout||'';
    const error=data.status.id===3 ? (output.length>16000?'Output exceeded the 16 KB display limit.':'') : data.compile_output||data.stderr||data.status.description;
    return {output:output.slice(0,16000),error:error.slice(0,16000),stderr:(data.stderr||'').slice(0,16000),elapsed:Date.now()-start,provider:'Judge0 CE'};
  } catch(error) {
    if(error instanceof HttpError) throw error;
    throw new HttpError(503,'Compiler request timed out or could not connect. Retry your test.');
  }
}
