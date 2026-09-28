import { database } from "@/db";
import { identity,jsonBody,failure,privateHeaders,HttpError } from "@/lib/server";
import { githubRequest,pushSolution } from "@/lib/github-sync";
import { z } from "zod";
import { githubConfig } from "@/lib/github-auth";
export async function GET() {try{
 const u=await identity();
 const connection=await database().prepare("SELECT login,repository,branch,auto_push AS autoPush FROM github_connections WHERE user_id=?").bind(u.userId).first();
 const jobs=await database().prepare("SELECT id,repository,path,status,url FROM github_pushes WHERE user_id=? ORDER BY rowid DESC LIMIT 30").bind(u.userId).all();
 return Response.json({connection,jobs:jobs.results,configured:githubConfig().ready},{headers:privateHeaders});
}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const u=await identity(request);const b=await jsonBody(request);
 if(b.action==="retry")return Response.json(await pushSolution(u.userId,z.string().uuid().parse(b.id)));
 const input=z.object({repository:z.string().regex(/^[\w.-]+\/[\w.-]+$/).max(200),autoPush:z.boolean()}).parse(b);
 const r=await githubRequest(u.userId,`repos/${input.repository}`);if(!r.ok)throw new HttpError(400,"Repository not found or inaccessible.");
 const repo=await r.json() as any;
 if(repo.private||!repo.permissions?.push||repo.archived||!repo.default_branch)throw new HttpError(400,"Choose a public, initialized repository where you have write access.");
 const result=await database().prepare("UPDATE github_connections SET repository=?,branch=?,auto_push=? WHERE user_id=? RETURNING user_id").bind(repo.full_name,repo.default_branch,input.autoPush?1:0,u.userId).first();
 if(!result)throw new HttpError(400,"Connect GitHub first.");
 return Response.json({ok:true});
}catch(e){return failure(e);}}
