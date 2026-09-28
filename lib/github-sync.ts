import { database } from "@/db";
import { decryptToken } from "./github-auth";
import { HttpError } from "./server";
import { languageConfigs } from "./languages";
export async function githubRequest(userId:string,path:string,init:RequestInit={}) {
  const c=await database().prepare("SELECT token FROM github_connections WHERE user_id=?").bind(userId).first<{token:string}>();
  if(!c)throw new HttpError(400,"Connect GitHub first.");
  const token=await decryptToken(c.token,userId);
  try{return await fetch(`https://api.github.com/${path}`,{...init,headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","User-Agent":"CodeMentor","Content-Type":"application/json"},signal:AbortSignal.timeout(20000)});}catch{throw new HttpError(503,"GitHub unavailable. Your solution is still saved.");}
}
export async function pushSolution(userId:string,id:string) {
  const db=database();
  const record=await db.prepare("SELECT title,data FROM records WHERE id=? AND user_id=? AND kind='snippet'").bind(id,userId).first<{title:string;data:string}>();
  if(!record)throw new HttpError(404,"Saved solution not found.");
  const c=await db.prepare("SELECT repository,branch,auto_push FROM github_connections WHERE user_id=?").bind(userId).first<{repository:string;branch:string;auto_push:number}>();
  if(!c?.auto_push||!c.repository)return {status:"disabled"};
  const data=JSON.parse(record.data);if(typeof data.code!=="string"||data.code.length>50000)throw new HttpError(400,"Save a code solution under 50 KB.");
  const extension=languageConfigs.find(l=>l.name===data.language)?.extension||"txt";
  const path=`codementor/${id}/${record.title.replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,70)||"solution"}.${extension}`;
  await db.prepare("INSERT OR IGNORE INTO github_pushes(id,user_id,repository,branch,path,status) VALUES(?,?,?,?,?,'pending')").bind(id,userId,c.repository,c.branch,path).run();
  const destination=await db.prepare("SELECT repository,branch FROM github_pushes WHERE id=? AND user_id=?").bind(id,userId).first<{repository:string;branch:string}>();
  if(destination && (destination.repository!==c.repository||destination.branch!==c.branch))throw new HttpError(409,"This saved push belongs to your previous repository or branch. Select that destination again before retrying.");
  const job=await db.prepare("UPDATE github_pushes SET status='pushing' WHERE id=? AND user_id=? AND status IN ('pending','failed') RETURNING repository,branch,path").bind(id,userId).first<{repository:string;branch:string;path:string}>();
  if(!job)return {status:"already_processed"};
  try {
    const bytes=new TextEncoder().encode(data.code);let binary="";for(const b of bytes)binary+=String.fromCharCode(b);const content=btoa(binary);
    const base=`repos/${job.repository}/contents/${job.path}`;
    const existing=await githubRequest(userId,`${base}?ref=${encodeURIComponent(job.branch)}`);
    let url="";
    if(existing.ok){const file=await existing.json() as any;if(file.content?.replace(/\s/g,"")!==content)throw new HttpError(409,"Remote file differs. Refusing to overwrite it.");url=file.html_url;}
    else {
      if(existing.status!==404)throw new HttpError(502,"Cannot access repository.");
      const r=await githubRequest(userId,base,{method:"PUT",body:JSON.stringify({message:`Save solution: ${record.title}`,content,branch:job.branch})});
      if(!r.ok)throw new HttpError(502,"Push failed. Check repository permission and branch rules.");
      const result=await r.json() as any;url=result.content?.html_url||"";
    }
    await db.prepare("UPDATE github_pushes SET status='pushed',url=? WHERE id=? AND user_id=?").bind(url,id,userId).run();
    return {status:"pushed",url};
  }catch{await db.prepare("UPDATE github_pushes SET status='failed' WHERE id=? AND user_id=?").bind(id,userId).run();return {status:"failed"};}
}
