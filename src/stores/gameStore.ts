import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { getBrowserLocale } from '../i18n'

export const useGameStore = defineStore('game', () => {
  // State
  const selectedCharacters = ref<string[]>([])
  const selectedModules = ref<string[]>(['all'])
  const currentView = ref<'characters' | 'gamemaster' | 'rules'>('characters')
  const playerCount = ref<number>(5)
  const selectedVoice = ref<number>(0)
  const speechRate = ref<number>(1)
  const speechPitch = ref<number>(1)
  const currentLanguage = ref<string>('en')

  // Local storage keys
  const STORAGE_KEYS = {
    CHARACTERS: 'avalon_selected_characters',
    MODULES: 'avalon_selected_modules',
    VIEW: 'avalon_current_view',
    PLAYER_COUNT: 'avalon_player_count',
    SELECTED_VOICE: 'avalon_selected_voice',
    SPEECH_RATE: 'avalon_speech_rate',
    SPEECH_PITCH: 'avalon_speech_pitch',
    LANGUAGE: 'avalon_language'
  }

  // Load from localStorage on store initialization
  const loadFromStorage = () => {
    try {
      const storedCharacters = localStorage.getItem(STORAGE_KEYS.CHARACTERS)
      const storedModules = localStorage.getItem(STORAGE_KEYS.MODULES)
      const storedView = localStorage.getItem(STORAGE_KEYS.VIEW)
      const storedPlayerCount = localStorage.getItem(STORAGE_KEYS.PLAYER_COUNT)

      if (storedCharacters) {
        selectedCharacters.value = JSON.parse(storedCharacters)
      }

      if (storedModules) {
        selectedModules.value = JSON.parse(storedModules)
      }

      if (storedView && ['characters', 'gamemaster', 'rules'].includes(storedView)) {
        currentView.value = storedView as 'characters' | 'gamemaster' | 'rules'
      }

      if (storedPlayerCount) {
        const count = parseInt(storedPlayerCount)
        if (count >= 5 && count <= 10) {
          playerCount.value = count
        }
      }

      const storedVoice = localStorage.getItem(STORAGE_KEYS.SELECTED_VOICE)
      if (storedVoice) {
        const voiceIndex = parseInt(storedVoice)
        if (voiceIndex >= 0) {
          selectedVoice.value = voiceIndex
        }
      }

      const storedRate = localStorage.getItem(STORAGE_KEYS.SPEECH_RATE)
      if (storedRate) {
        const rate = parseFloat(storedRate)
        if (rate >= 0.5 && rate <= 2) {
          speechRate.value = rate
        }
      }

      const storedPitch = localStorage.getItem(STORAGE_KEYS.SPEECH_PITCH)
      if (storedPitch) {
        const pitch = parseFloat(storedPitch)
        if (pitch >= 0.5 && pitch <= 2) {
          speechPitch.value = pitch
        }
      }

      const storedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE)
      if (storedLanguage) {
        currentLanguage.value = storedLanguage
      } else {
        // No stored language, use browser detection
        currentLanguage.value = getBrowserLocale()
      }
    } catch (error) {
      console.warn('Failed to load game state from localStorage:', error)
      // Reset to defaults if loading fails
      resetState()
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(selectedCharacters.value))
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(selectedModules.value))
      localStorage.setItem(STORAGE_KEYS.VIEW, currentView.value)
      localStorage.setItem(STORAGE_KEYS.PLAYER_COUNT, playerCount.value.toString())
      localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, selectedVoice.value.toString())
      localStorage.setItem(STORAGE_KEYS.SPEECH_RATE, speechRate.value.toString())
      localStorage.setItem(STORAGE_KEYS.SPEECH_PITCH, speechPitch.value.toString())
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, currentLanguage.value)
    } catch (error) {
      console.warn('Failed to save game state to localStorage:', error)
    }
  }

  // Watch for changes and auto-save
  watch(selectedCharacters, saveToStorage, { deep: true })
  watch(selectedModules, saveToStorage, { deep: true })
  watch(currentView, saveToStorage)
  watch(playerCount, saveToStorage)
  watch(selectedVoice, saveToStorage)
  watch(speechRate, saveToStorage)
  watch(speechPitch, saveToStorage)
  watch(currentLanguage, saveToStorage)

  // Actions
  const setSelectedCharacters = (characters: string[]) => {
    selectedCharacters.value = characters
  }

  const setSelectedModules = (modules: string[]) => {
    selectedModules.value = modules
  }

  const setCurrentView = (view: 'characters' | 'gamemaster' | 'rules') => {
    currentView.value = view
  }

  const setPlayerCount = (count: number) => {
    if (count >= 5 && count <= 10) {
      playerCount.value = count
    }
  }

  const setSelectedVoice = (voiceIndex: number) => {
    if (voiceIndex >= 0) {
      selectedVoice.value = voiceIndex
    }
  }

  const setSpeechRate = (rate: number) => {
    if (rate >= 0.5 && rate <= 2) {
      speechRate.value = rate
    }
  }

  const setSpeechPitch = (pitch: number) => {
    if (pitch >= 0.5 && pitch <= 2) {
      speechPitch.value = pitch
    }
  }

  const setCurrentLanguage = (language: string) => {
    currentLanguage.value = language
  }

  const handleCharactersSelected = (characterIds: string[], modules: string[]) => {
    setSelectedCharacters(characterIds)
    setSelectedModules(modules)
    setCurrentView('gamemaster')
  }

  const resetState = () => {
    selectedCharacters.value = []
    selectedModules.value = ['all']
    currentView.value = 'characters'
    playerCount.value = 5
    selectedVoice.value = 0
    speechRate.value = 1
    speechPitch.value = 1
    currentLanguage.value = getBrowserLocale()
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CHARACTERS)
      localStorage.removeItem(STORAGE_KEYS.MODULES)
      localStorage.removeItem(STORAGE_KEYS.VIEW)
      localStorage.removeItem(STORAGE_KEYS.PLAYER_COUNT)
      localStorage.removeItem(STORAGE_KEYS.SELECTED_VOICE)
      localStorage.removeItem(STORAGE_KEYS.SPEECH_RATE)
      localStorage.removeItem(STORAGE_KEYS.SPEECH_PITCH)
      localStorage.removeItem(STORAGE_KEYS.LANGUAGE)
      resetState()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  // Initialize store
  loadFromStorage()

  return {
    // State
    selectedCharacters,
    selectedModules,
    currentView,
    playerCount,
    selectedVoice,
    speechRate,
    speechPitch,
    currentLanguage,
    
    // Actions
    setSelectedCharacters,
    setSelectedModules,
    setCurrentView,
    setPlayerCount,
    setSelectedVoice,
    setSpeechRate,
    setSpeechPitch,
    setCurrentLanguage,
    handleCharactersSelected,
    resetState,
    clearStorage,
    loadFromStorage,
    saveToStorage
  }
})