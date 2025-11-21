<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/gameStore'
import { loadLocaleMessages, SUPPORT_LOCALES } from '../i18n'
import { getI18nInstance } from '../main'

const { t, locale } = useI18n()
const gameStore = useGameStore()

// Language options
const languageOptions = computed(() => [
  { title: 'English', value: 'en' },
  { title: 'Español', value: 'es' },
  { title: 'Magyar', value: 'hu' }
])

// Current selected language
const selectedLanguage = computed({
  get: () => gameStore.currentLanguage,
  set: async (newLanguage: string) => {
    if (SUPPORT_LOCALES.includes(newLanguage)) {
      try {
        const i18nInstance = getI18nInstance()
        
        // Load messages if not already loaded
        if (!i18nInstance.global.availableLocales.includes(newLanguage)) {
          const messages = await loadLocaleMessages(newLanguage)
          i18nInstance.global.setLocaleMessage(newLanguage, messages)
        }
        
        // Update locale immediately
        locale.value = newLanguage
        i18nInstance.global.locale.value = newLanguage
        
        // Update the store (this will persist to localStorage)
        gameStore.setCurrentLanguage(newLanguage)
        
        // Set HTML lang attribute
        document.querySelector('html')?.setAttribute('lang', newLanguage)
      } catch (error) {
        console.error('Failed to change language:', error)
      }
    }
  }
})
</script>

<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        prepend-icon="mdi-translate"
        class="text-none"
      >
        <span class="d-none d-sm-inline">
          {{ t('app.language') }}
        </span>
        <!-- <span class="d-sm-none">
          <v-icon>mdi-translate</v-icon>
        </span> -->
      </v-btn>
    </template>
    
    <v-list density="compact" min-width="200">
      <v-list-item
        v-for="language in languageOptions"
        :key="language.value"
        :value="language.value"
        @click="selectedLanguage = language.value"
        :active="selectedLanguage === language.value"
      >
        <v-list-item-title>{{ language.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>