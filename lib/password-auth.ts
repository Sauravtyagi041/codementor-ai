import {headers} from 'next/headers';
import {database} from '@/db';
export const SESSION_COOKIE='codementor_session';
export const SESSION_SECONDS=7*24*60*60;
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export function cookieToken(cookie:string|null){const parts=(cookie||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(SESSION_COOKIE+'='));if(parts.length!==1)return null;const token=parts[0].slice(SESSION_COOKIE.length+1);return /^[a-f0-9]{64}$/.test(token)?token:null;}
export async function sessionUser(){const h=await headers(),token=cookieToken(h.get('cookie'));if(!token)return null;const user=await database().prepare('SELECT a.id,a.email,a.name FROM auth_sessions s JOIN auth_accounts a ON a.id=s.user_id WHERE s.token_hash=? AND s.expires>?').bind(await digest(token),Date.now()).first<{id:string;email:string;name:string}>();return user?{userId:user.id,email:user.email,displayName:user.name,fullName:user.name}:null;}
export function sessionCookie(token:string,request:Request,seconds=SESSION_SECONDS){return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export function freshToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('');}
