import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/soloAJANS/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
