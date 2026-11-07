import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient()
export const { useSession } = authClient
// Account credentials and sessions are verified by the server. No browser-created tokens.
