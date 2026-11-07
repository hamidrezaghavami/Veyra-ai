import { randomUUID } from 'node:crypto'
import { pool } from './neon.ts'
import type { InvoiceRecord } from '../types.ts'

export const db = {
  async getInvoices(ownerId: string): Promise<InvoiceRecord[]> {
    const { rows } = await pool.query('SELECT data FROM veyra_invoice_records WHERE owner_id = $1 ORDER BY created_at DESC', [ownerId])
    return rows.map(row => row.data)
  },
  async addInvoice(ownerId: string, record: InvoiceRecord, validate: (record: InvoiceRecord, existing: InvoiceRecord[]) => InvoiceRecord) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [ownerId])
      const { rows } = await client.query('SELECT data FROM veyra_invoice_records WHERE owner_id=$1', [ownerId])
      const validated = validate(record, rows.map(row=>row.data))
      await client.query('INSERT INTO veyra_invoice_records(id, owner_id, data) VALUES ($1, $2, $3)', [record.id, ownerId, JSON.stringify(validated)])
      await client.query('COMMIT')
      return validated
    } catch (error) { await client.query('ROLLBACK'); throw error }
    finally { client.release() }
  },
  async updateInvoice(ownerId: string, id: string, updater: (record: InvoiceRecord, existing: InvoiceRecord[]) => InvoiceRecord) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [ownerId])
      const { rows } = await client.query('SELECT data FROM veyra_invoice_records WHERE owner_id=$1 AND id=$2 FOR UPDATE', [ownerId, id])
      if (!rows.length) throw Object.assign(new Error('Invoice not found.'), { status: 404 })
      const existing = await client.query('SELECT data FROM veyra_invoice_records WHERE owner_id=$1', [ownerId])
      const updated = updater(rows[0].data, existing.rows.map(row=>row.data))
      await client.query('UPDATE veyra_invoice_records SET data=$3, updated_at=NOW() WHERE owner_id=$1 AND id=$2', [ownerId, id, JSON.stringify(updated)])
      await client.query('COMMIT')
      return updated
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally { client.release() }
  },
  async addWaitlist(email: string) {
    const { rows } = await pool.query(`INSERT INTO veyra_waitlist_entries(email) VALUES ($1)
      ON CONFLICT(email) DO UPDATE SET email=EXCLUDED.email RETURNING position`, [email])
    return { position: Number(rows[0].position) }
  },
  async addContact(data: { name: string; email: string; company?: string; inquiryType: string; message: string }) {
    const id = randomUUID()
    await pool.query('INSERT INTO veyra_contact_messages(id, data) VALUES ($1,$2)', [id, JSON.stringify(data)])
    return { id }
  },
}
