import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  base: process.env.NODE_ENV === 'production' 
    ? (process.env.VITE_BASE_URL || '/avalon-game-master/')
    : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
