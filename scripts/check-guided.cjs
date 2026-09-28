const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict');
const cache={};function load(file){file=path.resolve(file);if(cache[file])return cache[file];const exports={};cache[file]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:p=>load(path.resolve(path.dirname(file),p+'.ts'))});return exports;}
const {guidedProblems,runnableCode}=load('lib/guided-problems.ts');const {compareOutput}=load('lib/compare-output.ts');let count=0;
assert.equal(new Set(guidedProblems.map(p=>p.id)).size,guidedProblems.length);
for(const p of guidedProblems){assert.ok(p.examples.length>=2&&p.hints.length>=2&&p.steps.length>=2,p.id);for(const id of p.similar)assert.ok(guidedProblems.some(x=>x.id===id),id);for(const test of p.tests){let output='';vm.runInNewContext(runnableCode(p,true),{stdin:test.input,console:{log:x=>output=String(x)}},{timeout:1000});assert.ok(compareOutput(output,test.expected,test.input,p.id),p.id+': '+output+' != '+test.expected);count++;}}
assert.ok(compareOutput('[0,3]','[1,2]','[[4,9,2,7],11]','pair'));
assert.ok(!compareOutput('[0,0]','[0,1]','[[5,5],10]','pair'));
console.log(`${guidedProblems.length} problems, ${count} sample tests and alternate-pair validation passed.`);
