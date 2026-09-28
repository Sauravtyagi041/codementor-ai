const fs=require('fs'),ts=require('typescript'),vm=require('vm');
function load(path){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports;}
const configs=load('lib/languages.ts').languageConfigs;
const ids=load('lib/execution-languages.ts').judgeLanguages;
(async()=>{for(const lang of configs.filter(x=>Object.hasOwn(ids,x.name))){try{
const r=await fetch('https://ce.judge0.com/submissions?wait=true',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language_id:ids[lang.name],source_code:lang.template,stdin:'',cpu_time_limit:3,wall_time_limit:10,enable_network:false,max_file_size:64}),signal:AbortSignal.timeout(55000)});
const d=await r.json();console.log(JSON.stringify({language:lang.name,http:r.status,output:d.stdout,error:d.compile_output||d.stderr,status:d.status}));
}catch(e){console.log(JSON.stringify({language:lang.name,error:e.message}));}}})();
