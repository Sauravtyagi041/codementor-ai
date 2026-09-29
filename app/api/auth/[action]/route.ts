import {startGoogle} from '@/lib/google-login';
import {emailDeliveryConfig,sendVerification,verifyEmail} from '@/lib/email-verification';
import {recoverPassword} from '@/lib/reset-password';
import {hash,compare} from 'bcryptjs';
import {z} from 'zod';
import {database} from '@/db';
import {jsonBody,failure,HttpError,privateHeaders} from '@/lib/server';
import {cookieToken,digest,freshToken,sessionCookie,SESSION_SECONDS} from '@/lib/password-auth';
const password=z.string().min(12,'Use at least 12 characters.').max(72).refine(p=>new TextEncoder().encode(p).length<=72,'Password must fit within 72 UTF-8 bytes.');
const credentials=z.object({email:z.string().trim().email().max(254).transform(s=>s.toLowerCase()),password,linkGoogle:z.boolean().optional(),name:z.string().trim().min(2).max(80).optional()});
// Dummy hash avoids skipping password work for unknown accounts.
const dummy='$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
async function limit(key:string,max:number){const now=Date.now(),bucket=Math.floor(now/900000),id=await digest(key+':'+bucket);const row=await database().prepare('INSERT INTO auth_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(id,(bucket+1)*900000,max).first();if(!row)throw new HttpError(429,'Too many attempts. Please wait 15 minutes and try again.');}
export async function POST(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new HttpError(403,'This request came from another site.');
 const action=new URL(request.url).pathname.split('/').pop();
 if(action==='logout'){
  const token=cookieToken(request.headers.get('cookie'));if(token)await database().prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await digest(token)).run();
  return new Response(null,{status:303,headers:{...privateHeaders,Location:'/login','Set-Cookie':sessionCookie('',request,0)}});
 }
 if(!['signup','login','forgot-password','reset-password','verify-email'].includes(action||''))throw new HttpError(404,'Unknown account action.');
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'Send account details as JSON.');
 // Only the hosting edge may supply CF-Connecting-IP; local requests share a bounded bucket.
 await limit('ip:'+(request.headers.get('cf-connecting-ip')||'local'),60);
 if(action==='verify-email')return await verifyEmail(await jsonBody(request));
 if(action==='forgot-password'||action==='reset-password')return await recoverPassword(action,await jsonBody(request),request);
 const body=credentials.parse(await jsonBody(request));await limit('account:'+body.email,10);
 await database().batch([database().prepare('DELETE FROM auth_limits WHERE expires<?').bind(Date.now()),database().prepare('DELETE FROM auth_sessions WHERE expires<?').bind(Date.now())]);
 let account=await database().prepare('SELECT id,password_hash,email_verified FROM auth_accounts WHERE email=?').bind(body.email).first<{id:string;password_hash:string|null;email_verified:number}>();
 if(action==='signup'){
  emailDeliveryConfig();
  if(!body.name)throw new HttpError(400,'Enter your name.');
  const passwordHash=await hash(body.password,12);
  if(account)throw new HttpError(409,'Could not create this account. Try signing in instead.');
  const id=crypto.randomUUID();const added=await database().prepare('INSERT OR IGNORE INTO auth_accounts(id,email,name,password_hash,created) VALUES(?,?,?,?,?) RETURNING id').bind(id,body.email,body.name,passwordHash,Date.now()).first();
  if(!added)throw new HttpError(409,'Could not create this account. Try signing in instead.');
  return await sendVerification(id,body.email);
 }else{
  const valid=await compare(body.password,account?.password_hash||dummy);if(!valid||!account?.password_hash)throw new HttpError(401,'Email or password is incorrect.');
 }
 if(body.linkGoogle)return await startGoogle(request,account.id);
 if(!account.email_verified)return await sendVerification(account.id,body.email);
 const token=freshToken();
 const old=cookieToken(request.headers.get('cookie'));
 const statements=[database().prepare('INSERT INTO auth_sessions(token_hash,user_id,expires) VALUES(?,?,?)').bind(await digest(token),account.id,Date.now()+SESSION_SECONDS*1000)];
 if(old)statements.push(database().prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await digest(old)));
 await database().batch(statements);
 return Response.json({ok:true},{status:action==='signup'?201:200,headers:{...privateHeaders,'Set-Cookie':sessionCookie(token,request)}});
 }catch(e){return failure(e);}}
