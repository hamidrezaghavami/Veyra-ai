import test from 'node:test'
import assert from 'node:assert/strict'
import { documentValueMatcher } from '../src/shared/documentMatch'

test('PDF highlights match complete invoice values across currency formats', () => {
  const amount = documentValueMatcher(1680)
  for (const text of ['USD 1,680.00', '1.680,00 ₺', '1\u202f680,00 EUR', '1680']) assert.equal(amount(text), true, text)
  for (const text of ['16800', '1,680.10', 'Order 1680', '1680 units']) assert.equal(amount(text), false, text)
  assert.equal(documentValueMatcher('INV-120')('INV-1200'), false)
  assert.equal(documentValueMatcher('INV-120')(' inv-120 '), true)
})
