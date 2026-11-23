import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Portable runtimes and standalone course references may contain locked/generated files.
      ignored: ['**/.tools/**', '**/B_Tree/**'],
    },
  },
})
