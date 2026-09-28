"use client";
import {useEffect,useState} from 'react';
type Timer={elapsed:number;started:number|null};
export function StudioStopwatch({problemId}:{problemId:string}){
 const [timer,setTimer]=useState<Timer>({elapsed:0,started:null}),[now,setNow]=useState(Date.now()),[ready,setReady]=useState(false);
 const storage='codementor-timer:'+problemId;
 useEffect(()=>{try{const raw=sessionStorage.getItem(storage);if(raw){const saved=JSON.parse(raw);if(Number.isFinite(saved.elapsed)&&saved.elapsed>=0&&(saved.started===null||Number.isFinite(saved.started)))setTimer(saved);}}catch{}setReady(true);},[storage]);
 useEffect(()=>{if(ready)try{sessionStorage.setItem(storage,JSON.stringify(timer));}catch{}},[timer,ready,storage]);
 useEffect(()=>{if(timer.started===null)return;const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[timer.started]);
 const total=Math.floor((timer.elapsed+(timer.started===null?0:Math.max(0,now-timer.started)))/1000),label=[Math.floor(total/3600),Math.floor(total/60)%60,total%60].map(n=>String(n).padStart(2,'0')).join(':');
 return <div className="studio-stopwatch" role="group" aria-label="Problem stopwatch"><time aria-label={'Elapsed time '+label}>{label}</time><button disabled={!ready} onClick={()=>{const n=Date.now();setNow(n);setTimer(t=>t.started===null?{...t,started:n}:{elapsed:t.elapsed+Math.max(0,n-t.started),started:null});}}>{timer.started===null?'Start':'Pause'}</button><button aria-label="Reset stopwatch" disabled={!ready} onClick={()=>{setTimer({elapsed:0,started:null});setNow(Date.now());}}>↺</button></div>;
}
