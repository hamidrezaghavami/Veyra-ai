export function veyraBackendPlugin() {
  return {
    name: 'veyra-backend-plugin',
    async configureServer(server) {
      const { createBackendApp } = await import('./app.js')
      const app = createBackendApp()

      // Handle all /api calls directly inside Vite dev server
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          app(req, res, next)
        } else {
          next()
        }
      })

      console.log('⚡ Veyra AI Backend middleware mounted on Vite /api')
    },
  }
}
