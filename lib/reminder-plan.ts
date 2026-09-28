export type ReminderPreferences = {enabled:boolean; streak:boolean; practice:boolean; contests:boolean; revision:boolean; time:string; timezone:string; quietStart:string; quietEnd:string; contestMinutes:number};
export const defaultReminders: ReminderPreferences = {enabled:true,streak:true,practice:true,contests:true,revision:true,time:"19:00",timezone:"Asia/Kolkata",quietStart:"23:00",quietEnd:"08:00",contestMinutes:30};
type RecordEntry = {id:string;kind:string;title:string;created:string;data:Record<string,any>};
export function reminderPlan(entries:RecordEntry[], p:ReminderPreferences, now:Date) {
  if (!p.enabled) return [];
  const date = (d:Date) => new Intl.DateTimeFormat("en-CA",{timeZone:p.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
  const time = new Intl.DateTimeFormat("en-GB",{timeZone:p.timezone,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(now);
  const quiet = p.quietStart === p.quietEnd ? false : p.quietStart < p.quietEnd ? time >= p.quietStart && time < p.quietEnd : time >= p.quietStart || time < p.quietEnd;
  if (quiet) return [];
  const today=date(now);
  const attempts=entries.filter(e=>e.kind==="attempt");
  const practiced=attempts.some(e=>date(new Date(e.created))===today);
  const calendar = new Date(`${today}T12:00:00Z`);calendar.setUTCDate(calendar.getUTCDate()-1);
  const yesterday=calendar.toISOString().slice(0,10);
  const out:{key:string;text:string}[]=[];
  if(time>=p.time && !practiced) {
    if(p.streak && attempts.some(e=>date(new Date(e.created))===yesterday)) out.push({key:`daily:${today}`,text:"🔥 Streak reminder: aaj abhi practice record nahi hui. Apni streak continue karne ke liye ek problem attempt karo."});
    else if(p.practice) out.push({key:`daily:${today}`,text:"📚 Daily practice reminder: aaj ek coding problem try karo aur apna attempt record karo."});
  }
  if(p.revision && time>=p.time) {
    const due=entries.filter(e=>e.kind==="revision"&&e.data.date===today);
    if(due.length) out.push({key:`revision:${today}`,text:`📝 Aaj ki revision: ${due.map(e=>e.title).slice(0,5).join(", ")}. Notes revise karo aur ek problem dobara try karo.`});
  }
  if(p.contests) for(const e of entries.filter(e=>e.kind==="contest")) {
    const starts = Date.parse(e.data.start);const minutes=(starts-now.getTime())/60000;
    if(Number.isFinite(starts)&&minutes>0&&minutes<=p.contestMinutes) out.push({key:`contest:${e.id}:${starts}`,text:`🏁 ${e.title} ${Math.ceil(minutes)} minutes mein start hoga. Apne saved contest details check karo.`});
  }
  return out;
}
