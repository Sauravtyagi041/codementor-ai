import {env} from 'cloudflare:workers';
import {database} from '@/db';
import {cookieToken,digest,freshToken} from '@/lib/password-auth';
import {HttpError} from '@/lib/server';
export function stateCookie(value:string,request:Request,age=600){return `google_login_state=${value}; Path=/api/google; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export async function startGoogle(request:Request,passwordUser?:string){const config=env as unknown as Record<string,string>,db=database();if(!config.GOOGLE_CLIENT_ID||!config.GOOGLE_CLIENT_SECRET||!config.GOOGLE_REDIRECT_URI)throw new HttpError(503,'Google sign-in needs administrator setup.');
   const state=freshToken(),verifier=freshToken();
   const current=cookieToken(request.headers.get('cookie'));
   const linkUser=current?await db.prepare('SELECT user_id FROM auth_sessions WHERE token_hash=? AND expires>?').bind(await digest(current),Date.now()).first<{user_id:string}>():null;
   const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
   const challenge=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
   await db.prepare('DELETE FROM google_login_states WHERE expires<?').bind(Date.now()).run();
   await db.prepare('INSERT INTO google_login_states(state,verifier,expires) VALUES(?,?,?)').bind(await digest(state),JSON.stringify({verifier,linkUser:passwordUser||linkUser?.user_id||null,passwordVerified:!!passwordUser}),Date.now()+600000).run();
   const params=new URLSearchParams({client_id:config.GOOGLE_CLIENT_ID,redirect_uri:config.GOOGLE_REDIRECT_URI,response_type:'code',scope:'openid email profile',state,code_challenge:challenge,code_challenge_method:'S256',prompt:'select_account'});
   const location='https://accounts.google.com/o/oauth2/v2/auth?'+params; return passwordUser?Response.json({googleRedirect:location},{headers:{'Set-Cookie':stateCookie(state,request),'Cache-Control':'no-store'}}):new Response(null,{status:303,headers:{Location:location,'Set-Cookie':stateCookie(state,request),'Cache-Control':'no-store'}});
}
