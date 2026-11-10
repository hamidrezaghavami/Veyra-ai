import test from 'node:test'
import assert from 'node:assert/strict'
import { reviewQueue } from '../src/shared/reviewQueue'
import type { InvoiceRecord } from '../src/shared/types'
test('review queue excludes decisions, prioritizes flags and due dates without changing ledger order', () => {
  const invoices = [
    { id:'a', status:'Pending Audit', dueDate:'2026-12-01' },
    { id:'b', status:'Approved', dueDate:'2026-01-01' },
    { id:'c', status:'Flagged', dueDate:'2026-12-02' },
    { id:'d', status:'Rejected', dueDate:'2026-01-01' },
    { id:'e', status:'Pending Audit', dueDate:'2026-11-01' },
  ] as InvoiceRecord[]
  assert.deepEqual(reviewQueue(invoices).map(i=>i.id), ['c','e','a'])
  assert.deepEqual(invoices.map(i=>i.id), ['a','b','c','d','e'])
})
