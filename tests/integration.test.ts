import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID, generateKeyPairSync, sign } from 'node:crypto'
import { createBackendApp } from '../src/backend/app.js'
import { pool } from '../src/backend/db/neon.js'
import { GeminiClient } from '../src/backend/gemini/client.js'
import type { ClerkAccount } from '../src/shared/types.ts'

const enabled = process.env.RUN_INTEGRATION_TESTS === '1'
test('Clerk signatures, verified account linking, isolated ledgers, and saved reviews', { skip: !enabled }, async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const issuer = 'https://verification.clerk.accounts.dev'
  process.env.VITE_CLERK_PUBLISHABLE_KEY = 'pk_test_' + Buffer.from('verification.clerk.accounts.dev$').toString('base64')
  process.env.CLERK_SECRET_KEY = 'sk_test_' + 'verification'.repeat(4)
  process.env.CLERK_JWT_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString()
  process.env.TRUSTED_ORIGINS = 'http://localhost:3000'
  const email = `clerk-${randomUUID()}@example.com`
  const legacyId = randomUUID()
  const providerIds = [`user_${randomUUID()}`, `user_${randomUUID()}`, `user_${randomUUID()}`, `user_${randomUUID()}`]
  const accounts: Record<string, ClerkAccount> = Object.fromEntries(providerIds.map((id,index) => [id, { id,firstName:index===0?'Alice':'Bob',lastName:null,primaryEmailAddressId:`email_${index}`,emailAddresses:[{id:`email_${index}`,emailAddress:index===0?email:`other-${index}-${email}`,verification:{status:index===2?'unverified':'verified'}}] }]))
  const loadAccount = async (id: string) => accounts[id]
  const server = createBackendApp({ loadAccount }).listen(0)
  await new Promise<void>(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as {port:number}).port}`
  const token = (id: string, changes: Record<string,unknown> = {}) => {
    const now = Math.floor(Date.now()/1000)
    const header = Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT',kid:'verification-key'})).toString('base64url')
    const payload = Buffer.from(JSON.stringify({iss:issuer,sub:id,sid:'sess_verification',azp:'http://localhost:3000',iat:now,nbf:now-5,exp:now+300,v:2,fva:[0,-1],sts:'active',...changes})).toString('base64url')
    return `${header}.${payload}.${sign('RSA-SHA256',Buffer.from(`${header}.${payload}`),privateKey).toString('base64url')}`
  }
  const req = async (jwt: string|null,path:string,method='GET',body?:unknown,cookie=false) => {
    const headers: Record<string,string> = {'accept':'application/json','content-type':'application/json','origin':'http://localhost:3000','x-veyra-request':'1'}
    if(jwt)headers[cookie?'cookie':'authorization'] = cookie ? `__clerk_db_jwt=verification; __session=${jwt}; __client_uat=${JSON.parse(Buffer.from(jwt.split('.')[1],'base64url').toString()).iat}` : `Bearer ${jwt}`
    const response = await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'})
    const text = await response.text()
    return {status:response.status,body:text?JSON.parse(text):{}}
  }
  try {
    await pool.query('INSERT INTO veyra_users(id,email,name) VALUES ($1,$2,$3)',[legacyId,email,'Legacy Alice'])
    assert.equal((await req(null,'/api/invoices')).status,401)
    assert.equal((await req(null,'/api/waitlist','POST',{email:'invalid'})).status,400)
    const waitlist=await req(null,'/api/waitlist','POST',{email});assert.equal(waitlist.status,201);assert.equal(typeof waitlist.body.data.position,'number')
    assert.equal((await req(null,'/api/contact','POST',{name:'Verification',email,inquiryType:'Test',message:'Isolated integration check'})).status,201)
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM veyra_waitlist_entries WHERE email=$1',[email])).rows[0].n,1)
    assert.equal((await pool.query("SELECT count(*)::int AS n FROM veyra_contact_messages WHERE data->>'email'=$1",[email])).rows[0].n,1)
    assert.equal((await req(token(providerIds[0],{exp:Math.floor(Date.now()/1000)-300}),'/api/invoices')).status,401)
    assert.equal((await req(token(providerIds[0],{azp:'https://untrusted.example'}),'/api/invoices')).status,401)
    const good = token(providerIds[0]);const pieces=good.split('.');pieces[1]=Buffer.from(JSON.stringify({sub:providerIds[1]})).toString('base64url')
    assert.equal((await req(pieces.join('.'),'/api/invoices')).status,401)
    assert.equal((await req(token(providerIds[2]),'/api/invoices')).status,403)
    const alice = await req(good,'/api/invoices');assert.equal(alice.status,200,JSON.stringify(alice.body))
    const linked = await pool.query('SELECT id,clerk_user_id FROM veyra_users WHERE email=$1',[email]);assert.equal(linked.rows[0].id,legacyId);assert.equal(linked.rows[0].clerk_user_id,providerIds[0])
    accounts[providerIds[3]].emailAddresses[0].emailAddress=email
    assert.equal((await req(token(providerIds[3]),'/api/invoices')).status,409)
    const cookie = await req(good,'/api/invoices','GET',undefined,true);assert.equal(cookie.status,200,JSON.stringify(cookie.body))
    const fields={invoiceNumber:'CLERK-VERIFICATION',vendor:'Verification Vendor',vendorCategory:'Logistics',issueDate:'2026-11-07',dueDate:'2026-11-30',subtotal:100,taxRate:0,taxAmount:0,total:999,currency:'USD',lineItems:[{description:'Transport',quantity:2,unitPrice:50,total:100}]}
    const upload=await req(good,'/api/invoices/upload-and-audit','POST',{fileName:'invoice.json',fileType:'application/json',data:Buffer.from(JSON.stringify(fields)).toString('base64')})
    assert.equal(upload.status,201,JSON.stringify(upload.body));const invoice=upload.body.data;assert.equal(invoice.status,'Flagged')
    assert.equal((await req(token(providerIds[1]),'/api/invoices')).body.data.length,0)
    assert.equal((await req(token(providerIds[1]),`/api/invoices/${invoice.id}/approve`,'PATCH',{note:'Attempted cross-account review'})).status,404)
    assert.equal((await req(good,`/api/invoices/${invoice.id}/approve`,'PATCH',{note:''})).status,400)
    const approved=await req(good,`/api/invoices/${invoice.id}/approve`,'PATCH',{note:'Reviewed synthetic test discrepancy'});assert.equal(approved.body.data.status,'Approved');assert.equal(approved.body.data.auditHistory[0].actor,email)
    const corrected=await req(good,`/api/invoices/${invoice.id}`,'PUT',{...fields,total:100});assert.equal(corrected.body.data.status,'Pending Audit')
    const originalGenerate = GeminiClient.generateContent
    try {
      GeminiClient.generateContent = async (parts: unknown[], instruction: string) => {
        const serialized=JSON.stringify(parts)
        if(serialized.includes('inlineData')) {
          assert(serialized.includes('application/pdf'))
          return JSON.stringify({...fields,invoiceNumber:'JS-PDF-CHECK',total:100})
        }
        assert(instruction.includes('Server-calculated currency totals'))
        assert(instruction.includes('JS-PDF-CHECK'))
        return 'Verified assistant response using the signed-in account ledger.'
      }
      const pdf=await req(good,'/api/invoices/upload-and-audit','POST',{fileName:'verification.pdf',fileType:'application/pdf',data:Buffer.from('%PDF-isolated-test').toString('base64')})
      assert.equal(pdf.status,201,JSON.stringify(pdf.body));assert.equal(pdf.body.data.extractedByAI,true)
      const chat=await req(good,'/api/chat','POST',{message:'Summarize my invoices.'})
      assert.equal(chat.status,200,JSON.stringify(chat.body));assert.equal(chat.body.data.sender,'assistant');assert.match(chat.body.data.text,/Verified assistant response/)
      assert.equal((await req(token(providerIds[1]),'/api/invoices')).body.data.length,0)
    } finally { GeminiClient.generateContent=originalGenerate }
    assert.equal((await req(null,'/api/invoices')).status,401)
    assert.equal((await req(null,'/api/auth/sign-in/email','POST',{email,password:'old-browser-login'})).status,404)
    // A second Clerk identity cannot claim an already-linked legacy ledger by reusing its email.
    accounts[providerIds[1]].emailAddresses[0].emailAddress=email
    // It already owns a separate local ledger; the existing mapping remains stable.
    assert.equal((await req(token(providerIds[1]),'/api/invoices')).body.data.length,0)
  } finally {
    await pool.query('DELETE FROM veyra_waitlist_entries WHERE email=$1',[email])
    await pool.query("DELETE FROM veyra_contact_messages WHERE data->>'email'=$1",[email])
    await pool.query('DELETE FROM veyra_users WHERE id=$1 OR clerk_user_id=ANY($2::text[])',[legacyId,providerIds])
    server.close();await pool.end()
  }
})
