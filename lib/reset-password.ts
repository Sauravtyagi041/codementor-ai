import {env} from 'cloudflare:workers';
import {hash} from 'bcryptjs';
import {z} from 'zod';
import {database} from '@/db';
import {digest,freshToken,sessionCookie} from './password-auth';
import {HttpError,privateHeaders} from './server';
export async function recoverPassword(action:string,body:unknown,request:Request){
 const db=database();
 if(action==='forgot-password'){
  const {email}=z.object({email:z.string().trim().email().max(254).transform(s=>s.toLowerCase())}).parse(body);
  const runtime=env as unknown as Record<string,string>;
  if(!runtime.RESEND_API_KEY||!runtime.AUTH_EMAIL_FROM||!runtime.APP_ORIGIN)throw new HttpError(503,'Password reset email is not configured yet. Please contact the app administrator.');
  const origin=new URL(runtime.APP_ORIGIN);if(origin.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(origin.hostname))throw new HttpError(503,'Password reset email configuration is unavailable.');
  const bucket=Math.floor(Date.now()/900000),key=await digest('reset-email:'+email+':'+bucket);
  const allowed=await db.prepare('INSERT INTO auth_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<3 RETURNING count').bind(key,(bucket+1)*900000).first();
  if(!allowed)throw new HttpError(429,'Please wait 15 minutes before requesting another reset link.');
  const user=await db.prepare('SELECT id FROM auth_accounts WHERE email=? AND password_hash IS NOT NULL').bind(email).first<{id:string}>();
  if(user){const token=freshToken(),tokenHash=await digest(token);await db.prepare('INSERT INTO password_resets(token_hash,user_id,expires) VALUES(?,?,?)').bind(tokenHash,user.id,Date.now()+15*60*1000).run();
   const link=origin.origin+'/reset-password#token='+token;
   try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+runtime.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':tokenHash},body:JSON.stringify({from:runtime.AUTH_EMAIL_FROM,to:[email],subject:'Reset your CodeMentor password',text:'You requested a new CodeMentor password. This link expires in 15 minutes and can be used once:\n\n'+link+'\n\nIf you did not request this, ignore this email.'}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('delivery');}catch{await db.prepare('DELETE FROM password_resets WHERE token_hash=?').bind(tokenHash).run();/* Do not disclose account existence through delivery errors. */}
  }
  return Response.json({ok:true,message:'If an account exists for this email, a reset link will arrive shortly. Check spam too.'},{headers:privateHeaders});
 }
 const input=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),password:z.string().min(12).max(72).refine(p=>new TextEncoder().encode(p).length<=72)}).parse(body);
 const tokenHash=await digest(input.token),passwordHash=await hash(input.password,12),now=Date.now();
 // D1 batch is a transaction: consume once and revoke all sessions atomically.
 const result=await db.batch([
  db.prepare('UPDATE auth_accounts SET password_hash=? WHERE id IN (SELECT user_id FROM password_resets WHERE token_hash=? AND expires>?)').bind(passwordHash,tokenHash,now),
  db.prepare('DELETE FROM auth_sessions WHERE user_id IN (SELECT user_id FROM password_resets WHERE token_hash=? AND expires>?)').bind(tokenHash,now),
  db.prepare('DELETE FROM password_resets WHERE user_id IN (SELECT user_id FROM password_resets WHERE token_hash=? AND expires>?) OR expires<=?').bind(tokenHash,now,now)
 ]);
 if(!result[0].meta.changes)throw new HttpError(400,'This reset link is invalid, expired or already used. Request a new one.');
 return Response.json({ok:true,message:'Password updated. Sign in with your new password.'},{headers:{...privateHeaders,'Set-Cookie':sessionCookie('',request,0)}});
}
