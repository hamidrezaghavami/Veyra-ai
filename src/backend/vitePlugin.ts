import type { Plugin } from 'vite'
import { createBackendApp } from './app.ts'

export function veyraBackendPlugin(): Plugin {
  return {
    name: 'veyra-backend-plugin',
    configureServer(server) {
      const app = createBackendApp()

      // Handle all /api calls directly inside Vite dev server
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          app(req as any, res as any, next)
        } else {
          next()
        }
      })

      console.log('⚡ Veyra AI Backend middleware mounted on Vite /api')
    },
  }
}
