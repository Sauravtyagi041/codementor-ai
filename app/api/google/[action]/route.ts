import {env} from 'cloudflare:workers';
import {database} from '@/db';
import {cookieToken,digest,freshToken,sessionCookie,SESSION_SECONDS} from '@/lib/password-auth';
import {z} from 'zod';
function stateCookie(value:string,request:Request,age=600){return `google_login_state=${value}; Path=/api/google; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export async function GET(request:Request){
 const config=env as unknown as Record<string,string>,url=new URL(request.url);
 const redirect=(path:string)=>new Response(null,{status:303,headers:{Location:path,'Cache-Control':'no-store','Set-Cookie':stateCookie('',request,0)}});
 if(!config.GOOGLE_CLIENT_ID||!config.GOOGLE_CLIENT_SECRET||!config.GOOGLE_REDIRECT_URI)return redirect('/login?google=setup');
 const db=database();
 try{
  if(url.pathname.endsWith('/start')){
   const state=freshToken(),verifier=freshToken();
   const current=cookieToken(request.headers.get('cookie'));
   const linkUser=current?await db.prepare('SELECT user_id FROM auth_sessions WHERE token_hash=? AND expires>?').bind(await digest(current),Date.now()).first<{user_id:string}>():null;
   const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
   const challenge=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
   await db.prepare('DELETE FROM google_login_states WHERE expires<?').bind(Date.now()).run();
   await db.prepare('INSERT INTO google_login_states(state,verifier,expires) VALUES(?,?,?)').bind(await digest(state),JSON.stringify({verifier,linkUser:linkUser?.user_id||null}),Date.now()+600000).run();
   const params=new URLSearchParams({client_id:config.GOOGLE_CLIENT_ID,redirect_uri:config.GOOGLE_REDIRECT_URI,response_type:'code',scope:'openid email profile',state,code_challenge:challenge,code_challenge_method:'S256',prompt:'select_account'});
   return new Response(null,{status:303,headers:{Location:'https://accounts.google.com/o/oauth2/v2/auth?'+params,'Set-Cookie':stateCookie(state,request),'Cache-Control':'no-store'}});
  }
  if(!url.pathname.endsWith('/callback'))return redirect('/login?google=failed');
  const state=url.searchParams.get('state')||'',code=url.searchParams.get('code');
  const cookies=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith('google_login_state='));
  if(!/^[a-f0-9]{64}$/.test(state)||cookies.length!==1||cookies[0]!==('google_login_state='+state))return redirect('/login?google=session');
  const stored=await db.prepare('DELETE FROM google_login_states WHERE state=? AND expires>? RETURNING verifier').bind(await digest(state),Date.now()).first<{verifier:string}>();
  if(!stored||!code||url.searchParams.has('error'))return redirect('/login?google=session');
  const saved=stored.verifier.startsWith('{')?JSON.parse(stored.verifier) as {verifier:string;linkUser:string|null}:{verifier:stored.verifier,linkUser:null};
  const exchange=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:config.GOOGLE_CLIENT_ID,client_secret:config.GOOGLE_CLIENT_SECRET,redirect_uri:config.GOOGLE_REDIRECT_URI,grant_type:'authorization_code',code_verifier:saved.verifier}),signal:AbortSignal.timeout(15000)});
  if(!exchange.ok){const failure=await exchange.json().catch(()=>({})) as {error?:string};return redirect(failure.error==='invalid_client'?'/login?google=credentials':'/login?google=exchange');}
  const tokens=await exchange.json() as {access_token?:string};if(!tokens.access_token)return redirect('/login?google=failed');
  const info=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+tokens.access_token},signal:AbortSignal.timeout(15000)});if(!info.ok)return redirect('/login?google=failed');
  const profile=z.object({sub:z.string().min(1).max(255),email:z.string().email().max(254),email_verified:z.literal(true),name:z.string().max(200).optional()}).parse(await info.json());
  let identity=await db.prepare('SELECT user_id FROM google_identities WHERE sub=?').bind(profile.sub).first<{user_id:string}>();
  if(!identity){
   const email=profile.email.toLowerCase();
   // Never attach a Google identity to an existing account merely by matching email.
   const existing=await db.prepare('SELECT id FROM auth_accounts WHERE email=?').bind(email).first<{id:string}>();
   if(existing){
    const current=cookieToken(request.headers.get('cookie'));
    const active=current?await db.prepare('SELECT user_id FROM auth_sessions WHERE token_hash=? AND expires>?').bind(await digest(current),Date.now()).first<{user_id:string}>():null;
    if(saved.linkUser!==existing.id||active?.user_id!==existing.id)return redirect('/login?google=existing');
    await db.prepare('INSERT INTO google_identities(sub,user_id) VALUES(?,?)').bind(profile.sub,existing.id).run();
    identity={user_id:existing.id};
   }else{
   const id=crypto.randomUUID();
   await db.batch([db.prepare('INSERT INTO auth_accounts(id,email,name,password_hash,created) VALUES(?,?,?,NULL,?)').bind(id,email,(profile.name||email).slice(0,80),Date.now()),db.prepare('INSERT INTO google_identities(sub,user_id) VALUES(?,?)').bind(profile.sub,id)]);identity={user_id:id};
   }
  }
  const session=freshToken();await db.prepare('INSERT INTO auth_sessions(token_hash,user_id,expires) VALUES(?,?,?)').bind(await digest(session),identity.user_id,Date.now()+SESSION_SECONDS*1000).run();
  const headers=new Headers({Location:'/auth-complete', 'Cache-Control':'no-store'});headers.append('Set-Cookie',sessionCookie(session,request));headers.append('Set-Cookie',stateCookie('',request,0));
  return new Response(null,{status:303,headers});
 }catch{return redirect('/login?google=failed');}
}
