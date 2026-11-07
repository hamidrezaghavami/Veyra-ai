import test from 'node:test'
import assert from 'node:assert/strict'
import { auditInvoice } from '../src/shared/audit.ts'
import { invoiceFields } from '../src/backend/validation.ts'
import { GeminiClient } from '../src/backend/gemini/client.ts'
import { summarizeLedger } from '../src/shared/analytics.ts'
import { csvCell } from '../src/shared/export.ts'
import type { InvoiceRecord } from '../src/backend/types.ts'

export const clean: InvoiceRecord = {id:'bd1dced2-3a64-45ac-a328-5ca929f9296d',invoiceNumber:'TEST-001',vendor:'Example Vendor',vendorCategory:'Logistics',issueDate:'2026-11-07',dueDate:'2026-11-30',subtotal:100,taxRate:0,taxAmount:0,total:100,currency:'USD',status:'Pending Audit',flags:[],lineItems:[{id:'line-1',description:'Transport',quantity:2,unitPrice:50,total:100}],auditHistory:[],extractedByAI:false,confidenceScore:0}
test('clean zero-tax invoice passes without replacing valid zeroes',()=>assert.deepEqual(auditInvoice(clean,[]),[]))
test('incorrect grand total is flagged',()=>assert(auditInvoice({...clean,total:999},[]).some(f=>f.field==='total')))
test('zero-rated invoice with tax is flagged',()=>assert(auditInvoice({...clean,taxAmount:10,total:110},[]).some(f=>f.type==='tax_mismatch')))
test('incorrect line item totals are flagged independently',()=>assert(auditInvoice({...clean,lineItems:[{...clean.lineItems[0],total:90}]},[]).some(f=>f.field==='lineItems')))
test('duplicate checks are scoped to vendor and currency, excluding self',()=>{
 assert.equal(auditInvoice(clean,[clean]).length,0)
 assert(auditInvoice({...clean,id:'different'},[clean]).some(f=>f.type==='duplicate'))
 assert.equal(auditInvoice({...clean,id:'different',vendor:'Other Vendor'},[clean]).length,0)
 assert.equal(auditInvoice({...clean,id:'different',currency:'EUR'},[clean]).length,0)
})
test('rounding tolerance does not create false findings',()=>assert.deepEqual(auditInvoice({...clean,subtotal:99.999,total:99.999},[]),[]))
test('malformed financial data and privileged fields fail validation',()=>{
 const {invoiceNumber,vendor,vendorCategory,issueDate,dueDate,subtotal,taxRate,taxAmount,total,currency,lineItems}=clean
 const fields={invoiceNumber,vendor,vendorCategory,issueDate,dueDate,subtotal,taxRate,taxAmount,total,currency,lineItems}
 assert.equal(invoiceFields.parse(fields).taxRate,0)
 for(const changes of [{total:NaN},{subtotal:-10},{issueDate:'nonsense'},{lineItems:[]},{status:'Approved'},{ownerId:'other'}])assert.equal(invoiceFields.safeParse({...fields,...changes}).success,false)
})
test('spreadsheet formula injection and embedded quotes are escaped',()=>{
 assert.equal(csvCell('=HYPERLINK("x")'),'"\'=HYPERLINK(""x"")"')
 assert.equal(csvCell('ordinary'),'"ordinary"')
 assert.equal(csvCell('  @SUM(1)'), '"\'  @SUM(1)"')
})
test('invalid document magic bytes are rejected before AI calls',async()=>{
 await assert.rejects(()=>GeminiClient.extractInvoiceData({fileName:'invoice.pdf',fileType:'application/pdf',data:Buffer.from('not a pdf').toString('base64')}),/contents do not match/)
})
test('unconfigured AI returns an error instead of invented invoice data',async()=>{
 const old=process.env.GEMINI_API_KEY;delete process.env.GEMINI_API_KEY
 try{await assert.rejects(()=>GeminiClient.extractInvoiceData({fileName:'invoice.pdf',fileType:'application/pdf',data:Buffer.from('%PDF-sample').toString('base64')}),/temporarily unavailable/)}finally{if(old)process.env.GEMINI_API_KEY=old}
})

test('analytics separate currencies and exclude rejected category spend',()=>{
 const result=summarizeLedger([clean,{...clean,id:'eur',currency:'EUR',total:20},{...clean,id:'rejected',status:'Rejected',total:30}])
 assert.equal(result.find(i=>i.currency==='USD')?.pending,100)
 assert.equal(result.find(i=>i.currency==='USD')?.categories.Logistics,100)
 assert.equal(result.find(i=>i.currency==='EUR')?.pending,20)
})
