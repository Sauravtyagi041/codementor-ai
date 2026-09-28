import { identity, jsonBody, failure, HttpError, privateHeaders } from "@/lib/server";
import { database } from "@/db";
import { z } from "zod";
import { judgeLanguages } from '@/lib/execution-languages';
import { runJudge } from '@/lib/judge-runner';
export async function POST(request:Request){try{
 const user=await identity(request);
 const input=z.object({language:z.string().refine(v=>v==='C++'||v==='Julia'||Object.hasOwn(judgeLanguages,v)),code:z.string().min(1).max(50000),input:z.string().max(10000)}).parse(await jsonBody(request));
 const quota=await database().prepare("INSERT INTO ai_usage(user_id,day,count) VALUES(?,?,1) ON CONFLICT(user_id,day) DO UPDATE SET count=count+1 WHERE count<100 RETURNING count").bind(`${user.userId}:compiler`,new Date().toISOString().slice(0,10)).first();
 if(!quota)throw new HttpError(429,"Daily compiler limit reached (100 test runs). Try again tomorrow.");
 if(Object.hasOwn(judgeLanguages,input.language)) return Response.json(await runJudge(judgeLanguages[input.language],input.code,input.input,request.signal),{headers:privateHeaders});
 const start=Date.now();
 let response:Response;
 try{response=await fetch(input.language==="Julia"?"https://godbolt.org/api/compiler/julia_1_10_0/compile":"https://godbolt.org/api/compiler/g132/compile",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({source:input.code,lang:input.language==="Julia"?"julia":"c++",allowStoreCodeDebug:false,options:{userArguments:input.language==="C++"?"-std=c++17 -O0":"",compilerOptions:{executorRequest:true},filters:{execute:true},executeParameters:{stdin:input.input,args:[]}}}),signal:AbortSignal.any([request.signal,AbortSignal.timeout(30000)])});}catch{throw new HttpError(503,"Compiler service timed out or is unavailable. Please retry.");}
 if(!response.ok)throw new HttpError(response.status===429?429:503,"Compiler service is busy or unavailable. Please retry later.");
 const d=await response.json() as any;
 const lines=(a:any)=>Array.isArray(a)?a.map(l=>typeof l.text==='string'?l.text:'').join('\n').slice(0,16000):'';
 const build=d.buildResult;
 let error='';
 if(build&&build.code!==0)error=lines(build.stderr)||lines(build.stdout)||'Compilation failed.';
 else if(d.timedOut)error='Execution time limit exceeded.';
 else if(d.didExecute!==true)error=lines(d.stderr)||'Compiler did not execute the program. Include a valid main() function.';
 else if(d.code!==0)error=lines(d.stderr)||`Program exited with status ${d.code}.`;
 else if(d.truncated)error='Output exceeded the compiler output limit.';
 return Response.json({output:lines(d.stdout),error,diagnostics:lines(build?.stderr),stderr:lines(d.stderr),elapsed:Date.now()-start,provider:"Compiler Explorer"},{headers:privateHeaders});
}catch(e){return failure(e);}}
