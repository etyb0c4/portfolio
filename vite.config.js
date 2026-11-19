import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // relative paths, so the build works at a domain root or under any sub-path
  server: { port: 5199, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
})
