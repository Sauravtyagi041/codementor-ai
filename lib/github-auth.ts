import { env } from "cloudflare:workers";
import { HttpError } from "./server";
export function githubConfig() {
  const e = env as unknown as Record<string, string>;
  const ready = Boolean(e.GITHUB_CLIENT_ID && e.GITHUB_CLIENT_SECRET && /^[a-f0-9]{64}$/i.test(e.GITHUB_TOKEN_KEY || "") && e.GITHUB_CALLBACK_URL);
  return { ready, id: e.GITHUB_CLIENT_ID, secret: e.GITHUB_CLIENT_SECRET, key: e.GITHUB_TOKEN_KEY, callback: e.GITHUB_CALLBACK_URL };
}
export function configured() {
  const c = githubConfig();
  if (!c.ready) throw new HttpError(503, "GitHub connection setup is pending. The app owner needs to configure GitHub OAuth credentials. You can finish your profile and connect later.");
  const url = new URL(c.callback);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) throw new HttpError(503, "GitHub callback configuration is invalid.");
  return c;
}
export function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export async function encryptToken(token: string, userId: string) {
  const bytes = Uint8Array.from(configured().key.match(/.{2}/g)!, h => parseInt(h, 16));
  const key = await crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode(userId) }, key, new TextEncoder().encode(token));
  return `${base64url(iv)}.${base64url(new Uint8Array(encrypted))}`;
}
export async function decryptToken(value:string,userId:string) {
  const decode=(v:string)=>Uint8Array.from(atob(v.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
  const bytes=Uint8Array.from(configured().key.match(/.{2}/g)!,h=>parseInt(h,16));
  const key=await crypto.subtle.importKey("raw",bytes,"AES-GCM",false,["decrypt"]);
  const [iv,data]=value.split(".");
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:decode(iv),additionalData:new TextEncoder().encode(userId)},key,decode(data)));
}
