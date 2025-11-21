import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { setupI18n } from './i18n'
import './style.css'

// Global i18n instance
let i18nInstance: any = null

async function initApp() {
  const app = createApp(App)
  const pinia = createPinia()

  // Initialize Pinia first to access store
  app.use(pinia)
  
  // Import store after Pinia is initialized
  const { useGameStore } = await import('./stores/gameStore')
  const gameStore = useGameStore()
  
  // Initialize i18n with stored language or browser detection
  i18nInstance = await setupI18n({ 
    locale: gameStore.currentLanguage || undefined 
  })

  app.use(i18nInstance)
  app.use(vuetify)
  app.mount('#app')
}

// Export function to get global i18n instance
export function getI18nInstance() {
  return i18nInstance
}

initApp()
