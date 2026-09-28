import {identity,jsonBody,failure,HttpError,privateHeaders} from '@/lib/server';
import {database} from '@/db';
import {guidedProblems} from '@/lib/guided-problems';
import {compareOutput} from '@/lib/compare-output';
import {runJudge} from '@/lib/judge-runner';
import {judgeLanguages} from '@/lib/execution-languages';
import {z} from 'zod';
export async function POST(request:Request){try{
 const user=await identity(request);const input=z.object({problemId:z.string().max(150),language:z.string(),code:z.string().min(1).max(50000)}).parse(await jsonBody(request));
 const problem=guidedProblems.find(p=>p.id===input.problemId);if(!problem?.tests?.length)throw new HttpError(400,'Submissions are available for the complete original exercise collection.');
 const runtime=input.language==='JavaScript'?102:judgeLanguages[input.language];if(!runtime)throw new HttpError(400,'Submission judging is not available for this language yet. Use Run tests.');
 const db=database();const quota=await db.prepare('INSERT INTO ai_usage(user_id,day,count) VALUES(?,?,1) ON CONFLICT(user_id,day) DO UPDATE SET count=count+1 WHERE count<15 RETURNING count').bind(user.userId+':submissions',new Date().toISOString().slice(0,10)).first();if(!quota)throw new HttpError(429,'Daily submission limit reached (15).');
 const extras:Record<string,{input:string;expected:string}[]>={pair:[{input:'[[],0]',expected:'[]'},{input:'[[-4,0,4],0]',expected:'[0,2]'}],binary:[{input:'[[1],1]',expected:'0'},{input:'[[1],2]',expected:'-1'}],frequency:[{input:'[[3,2,1]]',expected:'1'}]};
 const tests=[...problem.tests,...(extras[problem.id]||[])];let passed=0,verdict='Accepted';
 const source=input.language==='JavaScript'?'const stdin = require("fs").readFileSync(0,"utf8"); const print=(...args)=>console.log(...args);\n'+input.code:input.code;
 for(const test of tests){const result=await runJudge(runtime,source,test.input,request.signal);if(result.error){verdict='Execution error';break;}if(!compareOutput(result.output,test.expected,test.input,problem.id)){verdict='Wrong answer';break;}passed++;}
 const id=crypto.randomUUID(),created=new Date().toISOString(),data={problemId:problem.id,topic:problem.topic,language:input.language,verdict,passed,total:tests.length,suiteVersion:1,source:'CodeMentor fixed suite'};
 await db.prepare('INSERT INTO records(id,user_id,kind,title,data,created) VALUES(?,?,?,?,?,?)').bind(id,user.userId,'submission',problem.title,JSON.stringify(data),created).run();
 return Response.json({entry:{id,kind:'submission',title:problem.title,data,created}}, {headers:privateHeaders});
 }catch(e){return failure(e);}}
