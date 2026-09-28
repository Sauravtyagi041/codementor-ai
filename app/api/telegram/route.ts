import { database } from "@/db";
import { identity,jsonBody,failure,privateHeaders,HttpError } from "@/lib/server";
import { telegram } from "@/lib/telegram";
import { z } from "zod";
const time=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const preferences=z.object({enabled:z.boolean(),streak:z.boolean(),practice:z.boolean(),contests:z.boolean(),revision:z.boolean(),time,quietStart:time,quietEnd:time,contestMinutes:z.union([z.literal(15),z.literal(30),z.literal(60)]),timezone:z.string().max(80).refine(v=>{try{new Intl.DateTimeFormat("en",{timeZone:v});return true;}catch{return false;}})});
export async function GET() {try{
  const u=await identity();const c=await database().prepare("SELECT preferences FROM telegram_connections WHERE user_id=?").bind(u.userId).first<{preferences:string}>();
  const history=await database().prepare("SELECT title,status,created FROM reminder_deliveries WHERE user_id=? ORDER BY created DESC LIMIT 15").bind(u.userId).all();
  const heartbeat=await database().prepare("SELECT value FROM scheduler_state WHERE key='last_run'").first<{value:string}>();
  return Response.json({connected:!!c,preferences:c?JSON.parse(c.preferences):null,history:history.results,lastRun:heartbeat?.value||null},{headers:privateHeaders});
}catch(e){return failure(e);}}
export async function POST(request:Request) {try{
  const u=await identity(request);const body=await jsonBody(request);
  if(body.action==="disconnect") {await database().batch([database().prepare("DELETE FROM telegram_connections WHERE user_id=?").bind(u.userId),database().prepare("DELETE FROM telegram_links WHERE user_id=?").bind(u.userId)]);return Response.json({ok:true});}
  const p=preferences.parse(body.preferences);
  if(body.action==="save") {const r=await database().prepare("UPDATE telegram_connections SET preferences=? WHERE user_id=? RETURNING user_id").bind(JSON.stringify(p),u.userId).first();if(!r)throw new HttpError(400,"Connect Telegram first.");return Response.json({ok:true});}
  if(body.action!=="link") throw new HttpError(400,"Invalid action.");
  const bot=await telegram("getMe");const token=crypto.randomUUID().replaceAll("-","");
  await database().batch([database().prepare("DELETE FROM telegram_links WHERE user_id=? OR expires<?").bind(u.userId,Date.now()),database().prepare("INSERT INTO telegram_links(token,user_id,expires,preferences) VALUES(?,?,?,?)").bind(token,u.userId,Date.now()+600000,JSON.stringify(p))]);
  return Response.json({url:`https://t.me/${bot.username}?start=${token}`},{headers:privateHeaders});
}catch(e){return failure(e);}}
