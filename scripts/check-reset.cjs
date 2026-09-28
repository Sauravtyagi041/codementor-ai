const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict'),{execFileSync}=require('child_process');
const origin='http://localhost:5173',email='reset-test-'+crypto.randomUUID()+'@example.test',password=crypto.randomBytes(18).toString('hex'),next=crypto.randomBytes(18).toString('hex');
async function post(action,body,cookie=''){return fetch(origin+'/api/auth/'+action,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(body),redirect:'manual'});}
function sql(text){fs.writeFileSync('work-reset-fixture.sql',text);execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file','work-reset-fixture.sql'],{env:{...process.env,WRANGLER_LOG_PATH:'.wrangler/logs'},stdio:'pipe'});}
(async()=>{try{
const signup=await post('signup',{email,password,name:'Reset test'});assert.equal(signup.status,201);const cookie=signup.headers.get('set-cookie').split(';')[0];
const token=crypto.randomBytes(32).toString('hex'),expired=crypto.randomBytes(32).toString('hex');const digest=t=>crypto.createHash('sha256').update(t).digest('hex');
sql(`INSERT INTO password_resets SELECT '${digest(token)}',id,${Date.now()+900000} FROM auth_accounts WHERE email='${email}'; INSERT INTO password_resets SELECT '${digest(expired)}',id,${Date.now()-1000} FROM auth_accounts WHERE email='${email}';`);
assert.equal((await post('reset-password',{token:expired,password:next})).status,400);
assert.equal((await post('reset-password',{token,password:'short'})).status,400);
assert.equal((await post('reset-password',{token,password:next})).status,200);
assert.equal((await post('reset-password',{token,password:next})).status,400);
assert.equal((await post('login',{email,password})).status,401);
assert.equal((await post('login',{email,password:next})).status,200);
assert.equal((await fetch(origin+'/api/workspace',{headers:{Cookie:cookie}})).status,401);
assert.equal((await post('forgot-password',{email})).status,503); // No email credentials configured in this local test environment.
console.log('PASS: reset, expired/weak/reused rejection, old password rejected, new password accepted, old session revoked, missing mail configuration explicit. No email sent.');
}finally{sql(`DELETE FROM auth_accounts WHERE email='${email}';`);fs.unlinkSync('work-reset-fixture.sql');}})().catch(e=>{console.error(e.message);process.exitCode=1});
