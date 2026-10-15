import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'coh-embedded-api-server',
      configureServer(viteServer) {
        viteServer.middlewares.use(async (req, res, next) => {
          if (!req.url || !req.url.startsWith('/api')) {
            return next();
          }
          try {
            process.env.COH_EMBEDDED_API = '1';
            const serverModulePath = './server.js';
            const mod = (await import(/* @vite-ignore */ serverModulePath)) as { default: (req: unknown, res: unknown, next: unknown) => unknown };
            const app = mod.default;
            return app(req, res, next);
          } catch (err) {

            console.error('[Vite Embedded API Error]', err);
            return next(err);
          }
        });
      }
    }
  ]
})


