import type { Plugin } from 'vite'

export function veyraBackendPlugin(): Plugin {
  return {
    name: 'veyra-backend-plugin',
    async configureServer(server) {
      const { createBackendApp } = await import('./app.ts')
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
