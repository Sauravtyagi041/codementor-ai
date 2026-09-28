// Input is the unmodified problem list from the official Codeforces API.
const fs=require('fs');const catalog=JSON.parse(fs.readFileSync('work-cf-catalog.json','utf8'));
const excluded=new Set(['interactive','*special']);const tags=[...new Set(catalog.flatMap(p=>p.tags))].filter(t=>!excluded.has(t));
const topics=[],problems={};
for(const tag of tags){const pool=catalog.filter(p=>p.rating&&p.contestId&&p.tags.includes(tag)&&!p.tags.some(t=>excluded.has(t))).sort((a,b)=>a.rating-b.rating||a.contestId-b.contestId||a.index.localeCompare(b.index));
 if(pool.length<100)continue;
 // Equally spaced selection covers the available rating range, rather than only the easiest 100.
 const selected=Array.from({length:100},(_,i)=>pool[Math.round(i*(pool.length-1)/99)]);
 const ids=selected.map(p=>{const id=p.contestId+'-'+p.index;problems[id]={id,title:p.name,rating:p.rating,tags:p.tags,url:`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`};return id;});
 if(new Set(ids).size!==100)throw Error('Duplicate topic selection: '+tag);
 topics.push({id:tag,title:tag==='dp'?'Dynamic programming':tag==='dsu'?'Disjoint set union':tag==='fft'?'Fast Fourier transform':tag[0].toUpperCase()+tag.slice(1),available:pool.length,ids});
}
topics.sort((a,b)=>a.title.localeCompare(b.title));
fs.mkdirSync('public',{recursive:true});fs.writeFileSync('public/practice-bank.json',JSON.stringify({source:'https://codeforces.com/api/problemset.problems',updated:new Date().toISOString(),topics,problems}));
console.log(JSON.stringify({topics:topics.length,perTopic:100,uniqueProblems:Object.keys(problems).length,minimumRating:Math.min(...Object.values(problems).map(p=>p.rating))}));
