"use client";
import {useEffect,useState} from "react";
import {Button} from "@/components/ui/button";
import {api} from "./workspace-context";
export function GitHubConnect(){
 const [state,setState]=useState<any>(null),[repo,setRepo]=useState(""),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function load(){try{const s=await api("github/sync");setState(s);setRepo(s.connection?.repository||"");setEnabled(!!s.connection?.autoPush);}catch(e){setError((e as Error).message);}}
 useEffect(()=>{void load();const status=new URLSearchParams(window.location.search).get("github");const reasons:Record<string,string>={failed_session:"Your app sign-in expired. Sign in here and connect GitHub again.",failed_state:"This connection link expired or was already used. Click Connect GitHub for a fresh link.",failed_network:"The server could not reach GitHub. Retry the connection.",failed_incorrect_client_credentials:"The app's GitHub Client ID or Secret was rejected.",failed_redirect_uri_mismatch:"The callback URL in GitHub must match the app's callback URL exactly.",failed_bad_verification_code:"GitHub's authorization code expired or was already used. Start a fresh connection.",failed_exchange:"GitHub could not complete authorization. Start a fresh connection.",failed_profile:"GitHub authorization succeeded but the profile could not be loaded. Retry.",failed_storage:"The account could not be saved. Please retry after the app's database is checked.",cancelled:"GitHub authorization was cancelled.",failed:"The earlier connection failed. Retry to see the specific reason."};if(status&&reasons[status])setError(reasons[status]);},[]);
 async function act(fn:()=>Promise<void>){setBusy(true);setError("");try{await fn();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section className="surface"><h3>GitHub auto-push</h3>
 <p>{state?.connection?`Connected as ${state.connection.login}`:"Connect once to save future Code Studio solutions to GitHub."}</p>
 {state?.configured===false&&<p role="status">GitHub connection is awaiting app-owner setup. Your solutions still save here. The owner needs to configure the GitHub OAuth Client ID and Client Secret.</p>}
 <Button type="button" disabled={busy||!state?.configured} onClick={()=>act(async()=>{const r=await api("github/connect",{});window.location.assign(r.url);})}>{state?.connection?"Reauthorize GitHub":"Connect GitHub"}</Button>
 <p className="fine-print">GitHub authorization requests public repository access. Choose the destination below before enabling automatic pushes.</p>
 {state?.connection&&<><label className="field">Public repository (owner/name)<input value={repo} placeholder="yourname/coding-solutions" onChange={e=>setRepo(e.target.value)}/></label><label className="skill-option"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Automatically push new saved solutions</label>
 <p>Uses the repository's default branch. Create the repository with a README first. Each saved solution gets a separate file; existing remote code is never overwritten.</p>
 <Button type="button" disabled={busy} onClick={()=>act(async()=>{await api("github/sync",{repository:repo.trim(),autoPush:enabled});await load();})}>Save GitHub preferences</Button>
 <Button type="button" variant="outline" disabled={busy} onClick={()=>act(async()=>{await api("github/connection",{},"DELETE");await load();})}>Disconnect</Button></>}
 {error&&<p role="alert" className="error">{error}</p>}
 {!!state?.jobs?.length&&<details><summary>Recent pushes</summary>{state.jobs.map((j:any)=><div className="list-row" key={j.id}><span>{j.path} · {j.status}</span>{j.url&&<a href={j.url} target="_blank" rel="noreferrer">View on GitHub</a>}{j.status==="failed"&&<Button type="button" disabled={busy} onClick={()=>act(async()=>{await api("github/sync",{action:"retry",id:j.id});await load();})}>Retry</Button>}</div>)}</details>}
 </section>;
}
