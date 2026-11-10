import { randomUUID } from 'node:crypto'
import { createClerkClient } from '@clerk/express'
import { pool } from './db/neon.js'

export async function loadClerkAccount(id) {
  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  })
  return client.users.getUser(id)
}

// A verified Clerk identity maps to a stable local ledger owner. Existing records
// retain their owner IDs; no password, browser identity, or unverified email can link accounts.
export async function resolveLedgerOwner(account) {
  const primary = account.emailAddresses.find(
    (email) => email.id === account.primaryEmailAddressId
  )
  if (!primary || primary.verification?.status !== 'verified')
    throw Object.assign(
      new Error(
        'Verify your email in your account settings before accessing financial records.'
      ),
      { status: 403 }
    )
  const email = primary.emailAddress.trim().toLowerCase()
  const name =
    [account.firstName, account.lastName].filter(Boolean).join(' ') || email
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      'clerk-user:' + account.id,
    ])
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
      'clerk-email:' + email,
    ])
    const linked = await client.query(
      'SELECT id FROM veyra_users WHERE clerk_user_id=$1',
      [account.id]
    )
    let id
    if (linked.rows.length) id = linked.rows[0].id
    else {
      const legacy = await client.query(
        'SELECT id, clerk_user_id FROM veyra_users WHERE lower(email)=$1 FOR UPDATE',
        [email]
      )
      if (legacy.rows[0]?.clerk_user_id)
        throw Object.assign(
          new Error(
            'This ledger is already linked to another account. Please contact support.'
          ),
          { status: 409 }
        )
      if (legacy.rows.length) {
        id = legacy.rows[0].id
        await client.query(
          'UPDATE veyra_users SET clerk_user_id=$2 WHERE id=$1',
          [id, account.id]
        )
      } else {
        id = randomUUID()
        await client.query(
          'INSERT INTO veyra_users(id,clerk_user_id,email,name) VALUES ($1,$2,$3,$4)',
          [id, account.id, email, name.slice(0, 200)]
        )
      }
    }
    await client.query('COMMIT')
    return { id, email, name }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
