const assert=require('assert/strict'),fs=require('fs'),crypto=require('crypto');
const origin='http://localhost:5173',tag=crypto.randomUUID();const emails=[`auth-test-${tag}-a@example.test`,`auth-test-${tag}-b@example.test`];const password=crypto.randomBytes(18).toString('hex');
fs.writeFileSync('work-auth-cleanup.sql',`DELETE FROM records WHERE user_id IN (SELECT id FROM auth_accounts WHERE email IN ('${emails.join("','")}')); DELETE FROM profiles WHERE user_id IN (SELECT id FROM auth_accounts WHERE email IN ('${emails.join("','")}')); DELETE FROM auth_accounts WHERE email IN ('${emails.join("','")}');`);
async function post(action,body,cookie='',site=origin){return fetch(origin+'/api/auth/'+action,{method:'POST',redirect:'manual',headers:{Origin:site,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(body)});}
const cookie=r=>r.headers.get('set-cookie')?.split(';')[0]||'';
(async()=>{
 const a=await post('signup',{email:emails[0],password,name:'Auth Test A'});assert.equal(a.status,201,await a.clone().text());const ca=cookie(a);assert.ok(a.headers.get('set-cookie').includes('HttpOnly'));assert.ok(a.headers.get('set-cookie').includes('SameSite=Lax'));
 const b=await post('signup',{email:emails[1],password,name:'Auth Test B'});assert.equal(b.status,201);const cb=cookie(b);
 assert.equal((await post('signup',{email:emails[0],password,name:'Duplicate'})).status,409);
 assert.equal((await post('login',{email:emails[0],password:'invalid-password-123'})).status,401);
 assert.equal((await post('login',{email:emails[0],password},'', 'https://other.example')).status,403);
 const login=await post('login',{email:emails[0].toUpperCase(),password});assert.equal(login.status,200);const fresh=cookie(login);
 const saved=await fetch(origin+'/api/workspace',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:fresh},body:JSON.stringify({kind:'note',title:'Auth isolation fixture',data:{text:tag}})});assert.equal(saved.status,200,await saved.clone().text());
 const own=await fetch(origin+'/api/workspace',{headers:{Cookie:fresh}});assert.equal(own.status,200);assert.ok((await own.text()).includes(tag));
 const other=await fetch(origin+'/api/workspace',{headers:{Cookie:cb}});assert.equal(other.status,200);assert.ok(!(await other.text()).includes(tag));
 assert.equal((await fetch(origin+'/api/workspace')).status,401);
 assert.equal((await fetch(origin+'/api/workspace',{headers:{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':emails[0]}})).status,401);
 assert.equal((await post('logout',{},fresh)).status,303);
 assert.equal((await fetch(origin+'/api/workspace',{headers:{Cookie:fresh}})).status,401);
 await post('logout',{},ca);await post('logout',{},cb);
 console.log('PASS: signup, duplicate rejection, password verification, case normalization, CSRF, HttpOnly cookie, data isolation, anonymous/spoofed-header rejection, logout revocation.');
})().catch(e=>{console.error(e.message);process.exitCode=1});
