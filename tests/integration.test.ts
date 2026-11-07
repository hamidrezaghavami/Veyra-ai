import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createBackendApp } from '../src/backend/app.ts'
import { pool } from '../src/backend/db/neon.ts'

const enabled=process.env.RUN_INTEGRATION_TESTS==='1'
test('accounts → isolated saved invoices → review → persistence → sign out', {skip:!enabled}, async()=>{
 const server=createBackendApp().listen(0)
 await new Promise<void>(resolve=>server.once('listening',resolve))
 const addr=server.address() as {port:number};const base=`http://127.0.0.1:${addr.port}`
 const ids:string[]=[]
 const emails:string[]=[]
 const makeClient=()=>{
  let cookie=''
  return async(path:string,method='GET',body?:unknown)=>{
   const response=await fetch(base+path,{method,headers:{'content-type':'application/json','origin':'http://localhost:3000','x-veyra-request':'1',...(cookie?{cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)})
   const cookies=response.headers.getSetCookie();if(cookies.length)cookie=cookies.map(c=>c.split(';')[0]).join('; ')
   return {status:response.status,body:await response.text().then(text=>text ? JSON.parse(text) : {})}
  }
 }
 try{
  const anon=makeClient();assert.equal((await anon('/api/invoices')).status,401)
  const alice=makeClient(),bob=makeClient();const password=randomUUID()+'Aa!'
  for(const [client,name] of [[alice,'Alice'],[bob,'Bob']] as const){const email=`${name}-${randomUUID()}@example.com`;emails.push(email);const response=await client('/api/auth/sign-up/email','POST',{name,email,password});assert.equal(response.status,200,JSON.stringify(response.body));ids.push(response.body.user.id)}
  const stranger=makeClient();const wrong=await stranger('/api/auth/sign-in/email','POST',{email:emails[0],password:'incorrect-password'});assert.equal(wrong.status,401)
  const fields={invoiceNumber:'INTEGRATION-001',vendor:'Verification Vendor',vendorCategory:'Logistics',issueDate:'2026-11-07',dueDate:'2026-11-30',subtotal:100,taxRate:0,taxAmount:0,total:999,currency:'USD',lineItems:[{description:'Transport',quantity:2,unitPrice:50,total:100}]}
  const uploaded=await alice('/api/invoices/upload-and-audit','POST',{fileName:'invoice.json',fileType:'application/json',data:Buffer.from(JSON.stringify(fields)).toString('base64')});assert.equal(uploaded.status,201,JSON.stringify(uploaded.body));const invoice=uploaded.body.data;assert.equal(invoice.status,'Flagged');assert(invoice.flags.some((f:any)=>f.field==='total'))
  assert.equal((await bob('/api/invoices')).body.data.length,0)
  assert.equal((await bob(`/api/invoices/${invoice.id}/approve`,'PATCH',{note:'Attempted cross-account review'})).status,404)
  assert.equal((await alice(`/api/invoices/${invoice.id}/approve`,'PATCH',{note:''})).status,400)
  const approved=await alice(`/api/invoices/${invoice.id}/approve`,'PATCH',{note:'Reviewed discrepancy against original document'});assert.equal(approved.body.data.status,'Approved');assert(approved.body.data.flags.length>0);assert.equal(approved.body.data.auditHistory[0].actor,approved.body.data.auditHistory[0].actor.toLowerCase())
  const corrected=await alice(`/api/invoices/${invoice.id}`,'PUT',{...fields,total:100});assert.equal(corrected.body.data.status,'Pending Audit');assert.equal(corrected.body.data.flags.length,0)
  assert.equal((await alice(`/api/invoices/${invoice.id}`,'PUT',{...fields,total:100,status:'Approved'})).status,400)
  assert.equal((await alice('/api/invoices/reset','POST',{})).status,404)
  assert.equal((await alice('/api/auth/send-otp','POST',{email:'test@example.com'})).status,404)
  const freshServer=createBackendApp().listen(0);await new Promise<void>(resolve=>freshServer.once('listening',resolve))
  try{
   const addr=freshServer.address() as {port:number};const root=`http://127.0.0.1:${addr.port}`
   const login=await fetch(root+'/api/auth/sign-in/email',{method:'POST',headers:{'content-type':'application/json',origin:'http://localhost:3000'},body:JSON.stringify({email:emails[0],password})});assert.equal(login.status,200)
   const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')
   const records=await fetch(root+'/api/invoices',{headers:{cookie}}).then(r=>r.json());assert.equal(records.data[0].total,100)
  }finally{freshServer.close()}
  assert.equal((await alice('/api/auth/sign-out','POST',{})).status,200)
  assert.equal((await alice('/api/invoices')).status,401)
  assert.equal((await alice('/api/contact','POST',{name:'Test',email:'bad',inquiryType:'Test',message:'test'})).status,400)
 } finally {
  // Only disposable users created in this isolated verification branch are removed.
  if(ids.length)await pool.query('DELETE FROM "user" WHERE id=ANY($1::text[])',[ids])
  server.close();await pool.end()
 }
})
