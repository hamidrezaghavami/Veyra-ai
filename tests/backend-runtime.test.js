import test from 'node:test'
import assert from 'node:assert/strict'

// This suite runs in plain Node with TypeScript execution disabled. Loading the
// actual serverless entry point also checks every transitive server import.
test('JavaScript API starts and handles requests without a TypeScript loader', async () => {
  process.env.DATABASE_URL = ''
  process.env.TRUSTED_ORIGINS = 'http://localhost:3000'
  const { default: app } = await import('../api/index.js')
  const server = app.listen(0, '127.0.0.1')
  try {
    await new Promise(resolve => server.once('listening', resolve))
    const base = `http://127.0.0.1:${server.address().port}`
    const health = await fetch(base + '/api/health')
    assert.equal(health.status, 503)
    assert.equal((await health.json()).application, 'veyra-ai')
    assert.equal(health.headers.get('cache-control'), 'no-store')
    const unsafe = await fetch(base + '/api/invoices/upload-and-audit', {
      method: 'POST', headers: { origin: 'https://untrusted.example', 'x-veyra-request': '1', 'content-type': 'application/json' }, body: '{}',
    })
    assert.equal(unsafe.status, 403)
    assert.equal((await unsafe.json()).error, 'Request origin could not be verified.')
    assert.equal((await fetch(base + '/not-an-api-route')).status, 404)
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})
