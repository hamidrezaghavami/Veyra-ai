import test from 'node:test'
import assert from 'node:assert/strict'
import { translate } from '../src/i18n/translate.ts'
import { formatMoney } from '../src/shared/export.ts'
import turkish from '../src/i18n/tr.json'

test('English and Turkish preserve source values and interpolate interface counts', () => {
  assert.equal(translate('Upload invoice','en'),'Upload invoice')
  assert.equal(translate('Upload invoice','tr'),'Fatura yükle')
  assert.equal(translate('Acme Vendor 42','tr'),'Acme Vendor 42')
  assert.equal(translate('  Approve  ','tr'),'  Onayla  ')
  assert.equal(translate('Invoices shown: {visible} / {total}','tr',{visible:2,total:5}),'Gösterilen fatura: 2 / 5')
})
test('Generated findings localize without changing document identifiers', () => {
  const result=translate('Possible duplicate of INV-0042. Review the original before approval.','tr')
  assert(result.includes('INV-0042'));assert(result.includes('kopyası'))
  assert(translate('Line item “Custom vendor text” does not equal quantity × unit price.','tr').includes('“Custom vendor text”'))
  assert.equal(formatMoney(1234.5,'TRY','tr-TR'),new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(1234.5))
})
test('Core routes, account flows and disclosures have Turkish copy', () => {
  const dictionary:Record<string,string>=turkish
  for(const key of ['Features','Your invoices','Drop your invoice here','Review invoice','Privacy Policy','Terms of Service','Contact','Something went wrong','Read Documents','How to automate your first workflow in an afternoon'])assert(dictionary[key]?.trim(),key)
})
