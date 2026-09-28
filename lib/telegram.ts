import { env } from "cloudflare:workers";
import { HttpError } from "./server";
export async function telegram(method:string, data:Record<string,unknown>={}) {
  const token=(env as unknown as Record<string,string>).TELEGRAM_BOT_TOKEN;
  if(!token) throw new HttpError(503,"Telegram is not configured.");
  try {
    const r=await fetch(`https://api.telegram.org/bot${token}/${method}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
    const result=await r.json() as {ok:boolean;result:any;error_code?:number};
    if(!r.ok||!result.ok) throw new HttpError(502,`Telegram request failed (${result.error_code || r.status}).`);
    return result.result;
  } catch(e) { if(e instanceof HttpError) throw e; throw new HttpError(503,"Telegram is temporarily unavailable."); }
}
