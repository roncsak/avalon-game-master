<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AVALON_CHARACTERS } from '../types/avalon'
import { SUPPORT_LOCALES } from '../i18n'
import { useGameStore } from '../stores/gameStore'

const { t, locale } = useI18n()
const props = defineProps<{
  selectedCharacters: string[] // Now contains character IDs
}>()

const emit = defineEmits<{
  backToSelection: []
}>()

const gameStore = useGameStore()

const isPlaying = ref(false)
const currentStep = ref(-1)
const speechSupported = ref(false)
const voices = ref<SpeechSynthesisVoice[]>([])
const activeTimeouts = ref<number[]>([])
const selectedLanguage = ref(locale.value)

// Get character data for selected characters
const characters = computed(() => 
  props.selectedCharacters.map(id => 
    AVALON_CHARACTERS.find(c => c.id === id)!
  ).filter(Boolean)
)

const goodCharacters = computed(() => 
  characters.value.filter(c => c.alignment === 'good')
)

const evilCharacters = computed(() => 
  characters.value.filter(c => c.alignment === 'evil')
)

// Computed properties for voice settings with explicit getters/setters
const selectedVoiceModel = computed({
  get: () => gameStore.selectedVoice,
  set: (value: number) => gameStore.setSelectedVoice(value)
})

const speechRateModel = computed({
  get: () => gameStore.speechRate,
  set: (value: number) => gameStore.setSpeechRate(value)
})

const speechPitchModel = computed({
  get: () => gameStore.speechPitch,
  set: (value: number) => gameStore.setSpeechPitch(value)
})

// Available languages for the language filter
const availableLanguages = computed(() => {
  const getLanguageName = (langCode: string): string => {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
      const mainLangCode = langCode.split('-')[0]
      if (mainLangCode) {
        const languageName = displayNames.of(mainLangCode)
        return languageName || langCode
      }
      return langCode
    } catch {
      return langCode
    }
  }

  // Get available speech synthesis languages that are also supported by the game
  const availableSpeechLanguages = [...new Set(voices.value.map(voice => voice.lang.split('-')[0]))]
    .filter((langCode): langCode is string => Boolean(langCode))
  
  // Only show languages that are both supported by the game AND have speech synthesis voices
  const supportedLanguages = SUPPORT_LOCALES
    .filter(gameLanguage => availableSpeechLanguages.includes(gameLanguage))
    .map(langCode => ({
      title: getLanguageName(langCode),
      value: langCode,
      sortKey: getLanguageName(langCode)
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ title, value }) => ({ title, value }))
    
  return [{ title: t('gameMaster.allLanguages'), value: '' }, ...supportedLanguages]
})

// Filtered voices for the dropdown
const filteredVoices = computed(() => {
  let filtered = voices.value
  
  // Filter by language code (not full locale)
  if (selectedLanguage.value) {
    filtered = filtered.filter(voice => voice.lang.split('-')[0] === selectedLanguage.value)
  }
  
  return filtered.map((voice) => {
    const actualIndex = voices.value.indexOf(voice)
    return {
      title: `${voice.name} (${voice.lang})`,
      value: actualIndex
    }
  })
})

// Generate game script
const gameScript = computed(() => {
  const script = [t('gameScript.initialSpeech')]
  const minions = t(`characters.minion-of-mordred.name`, 2)

  // Evil characters see each other (except those cant reveal itself)
  const minionsAppearGood = evilCharacters.value.filter(c => 
      c.appearance?.some(app => app.appears === 'good' && app.to === 'evil')
  )

  const evilReveal = evilCharacters.value.filter(c => 
    !minionsAppearGood.some(minion => minion.id === c.id)
  )
  
  if (evilReveal.length > 0) {
    const visibleNames = evilReveal.map(c => t(`characters.${c.id}.name`)).join(', ')
    if (minionsAppearGood.length > 0) {
      const hiddenNames = minionsAppearGood.map(c => t(`characters.${c.id}.name`)).join(', ')
      script.push(t('gameScript.minionsRevealWithHidden', { minions, visibleNames, hiddenNames }))
    } else {
      script.push(t('gameScript.minionsReveal', { minions, names: visibleNames }))
    }
    script.push(t('gameScript.closeEyes'))
  }
  
  // Merlin sees evil (except hidden)
  const merlin = characters.value.find(c => c.id === 'merlin')
  if (merlin) {
    const goodAppearsEvilToMerlin = goodCharacters.value.filter(c => 
      c.appearance?.some(app => app.appears === 'evil' && app.to === 'merlin')
    )
    const evilAppearsGoodToMerlin = evilCharacters.value.filter(c => 
      c.appearance?.some(app => app.appears === 'good' && app.to === 'merlin')
    )
    const visibleToMerlin = [...evilCharacters.value.filter(c => !evilAppearsGoodToMerlin.some(minion => minion.id === c.id)), ...goodAppearsEvilToMerlin];
    if (visibleToMerlin.length > 0) {
      const names = visibleToMerlin.map(c => t(`characters.${c.id}.name`)).join(', ')
      script.push(
        t('gameScript.merlinSees', { minions, names }),
        t('gameScript.merlinOpen'),
        t('gameScript.closeEyes')
      )
    }
  }
  
  // Percival sees Merlin and Morgana
  const percival = characters.value.find(c => c.id === 'percival')
  if (percival) {
    const playersAppearMerlinToPercival = characters.value.filter(c => c.appearance?.some(app => app.appears === 'merlin' && app.to === 'percival'))
    const visibleToPercival = [...characters.value.filter(c => c.id === 'merlin'), ...playersAppearMerlinToPercival]
    
    if (visibleToPercival.length > 0) {
      const names = visibleToPercival.map(c => t(`characters.${c.id}.name`)).join(t('gameScript.and'))
      script.push(
        t('gameScript.percivalSees', { names }),
        t('gameScript.percivalOpen', { names }),
        t('gameScript.closeEyes')
      )
    }
  }

  // Cleric
  const cleric = characters.value.find(c => c.id === 'cleric')
  if (cleric) {
    script.push(
      t('gameScript.clericCheck'),
      t('gameScript.clericOpen'),
      t('gameScript.closeEyes')
    )
  }

  // Untrustworthy Servant
  const untrustworthy = characters.value.find(c => c.id === 'untrustworthy-servant')
  if (untrustworthy) {
    const visibleToUntrustworthy = characters.value.filter(c => c.id === untrustworthy?.knows)
    if(visibleToUntrustworthy.length > 0) {
      const names = visibleToUntrustworthy.map(c => t(`characters.${c.id}.name`)).join(t('gameScript.and'))
      script.push(
        t('gameScript.untrustworthySees', { names }),
        t('gameScript.untrustworthyOpen', { names }),
        t('gameScript.closeEyes')
      )
    }
  }

  // Untrustworthy Servant (morgana-assassin variant)
  const untrustworthy_maVariant = characters.value.find(c => c.id === 'untrustworthy-servant-assassin')
  if (untrustworthy_maVariant) {
    const visibleToUntrustworthy_maVariant = characters.value.filter(c => c.id === untrustworthy_maVariant?.knows)
    if(visibleToUntrustworthy_maVariant.length > 0) {
      const names = visibleToUntrustworthy_maVariant.map(c => t(`characters.${c.id}.name`)).join(t('gameScript.and'))
      script.push(
        t('gameScript.untrustworthySees', { names }),
        t('gameScript.untrustworthyOpen', { names }),
        t('gameScript.closeEyes')
      )
    }
  }

  // Lancelot (default)
  const lancelot = characters.value.find(c => c.id === 'good-lancelot')
  if (lancelot) {
    script.push(
      t('gameScript.lancelots'),
      t('gameScript.lancelotsClose')
    )
  }
  
  // Senior Messenger
  const seniorMessenger = characters.value.find(c => c.id === 'senior-messenger')
  if (seniorMessenger) {
    const visibleToSeniorMessenger = characters.value.filter(c => c.id === seniorMessenger?.knows)
    if (visibleToSeniorMessenger.length > 0) {
      const names = visibleToSeniorMessenger.map(c => t(`characters.${c.id}.name`)).join(t('gameScript.and'))
      script.push(
        t('gameScript.seniorMessengerSees', { names }),
        t('gameScript.seniorMessengerOpen', { names }),
        t('gameScript.closeEyes')
      )
    }
  }
  
  script.push(t('gameScript.gameBegins'))
  
  return script
})

// Watch for locale changes and update selected language accordingly
watch(locale, (newLocale) => {
  selectedLanguage.value = newLocale
})

// Speech synthesis functions
const speak = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!speechSupported.value) {
      resolve()
      return
    }
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voices.value[gameStore.selectedVoice] || null
    utterance.rate = gameStore.speechRate
    utterance.pitch = gameStore.speechPitch
    
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    
    speechSynthesis.speak(utterance)
  })
}

const playScript = async () => {
  if (isPlaying.value) return
  
  isPlaying.value = true
  currentStep.value = 0
  activeTimeouts.value = []
  
  for (let i = 0; i < gameScript.value.length; i++) {
    // Check if narration was stopped
    if (!isPlaying.value) {
      break
    }
    
    currentStep.value = i
    const scriptLine = gameScript.value[i]
    if (scriptLine) {
      await speak(scriptLine)
    }
    
    // Check again after speaking in case it was stopped during speech
    if (!isPlaying.value) {
      break
    }
    
    // Add pause between steps with interruptible timeout
    if (i < gameScript.value.length - 1) {
      await new Promise<void>(resolve => {
        const timeoutId = window.setTimeout(resolve, 2000)
        activeTimeouts.value.push(timeoutId)
      })
    }
  }
  
  isPlaying.value = false
  currentStep.value = -1
  activeTimeouts.value = []
}

const stopScript = () => {
  speechSynthesis.cancel()
  isPlaying.value = false
  currentStep.value = -1
  
  // Clear all active timeouts
  activeTimeouts.value.forEach(timeoutId => {
    window.clearTimeout(timeoutId)
  })
  activeTimeouts.value = []
}

// Initialize speech synthesis
onMounted(() => {
  speechSupported.value = 'speechSynthesis' in window
  
  if (speechSupported.value) {
    let voicesInitialized = false
    
    const loadVoices = () => {
      voices.value = speechSynthesis.getVoices()
      
      // Only auto-select English voice on first load if no voice is stored
      if (!voicesInitialized && voices.value.length > 0) {
        voicesInitialized = true
        
        // If there's a stored voice, validate it's still available
        if (gameStore.selectedVoice >= 0 && gameStore.selectedVoice < voices.value.length) {
          // Stored voice is valid, keep it
          return
        }
        
        // No valid stored voice, try to find English voice
        const englishVoice = voices.value.findIndex(voice => 
          voice.lang.startsWith('en')
        )
        if (englishVoice !== -1) {
          gameStore.setSelectedVoice(englishVoice)
        }
      }
    }
    
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
  }
})
</script>

<template>
  <v-container fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h4 d-flex align-center justify-space-between">
            <div>
              <v-icon class="me-2 text-primary">mdi-microphone</v-icon>
              {{ t('gameMaster.title') }}
            </div>
            <v-btn
              variant="outlined"
              size="small"
              @click="emit('backToSelection')"
              prepend-icon="mdi-arrow-left"
            >
              {{ t('gameMaster.backToSelection') }}
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Selected Characters Summary -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card elevation="1" class="h-100">
          <v-card-title class="text-success">
            <v-icon class="me-2">mdi-shield-check</v-icon>
            {{ t('gameMaster.goodCharactersTitle', { count: goodCharacters.length }) }}
          </v-card-title>
          <v-card-text>
            <v-chip
              v-for="character in goodCharacters"
              :key="character.id"
              color="success"
              variant="elevated"
              class="ma-1"
            >
              <v-icon start>{{ character.icon }}</v-icon>
              {{ t(`characters.${character.id}.name`) }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card elevation="1" class="h-100">
          <v-card-title class="text-error">
            <v-icon class="me-2">mdi-skull</v-icon>
            {{ t('gameMaster.evilCharactersTitle', { count: evilCharacters.length }) }}
          </v-card-title>
          <v-card-text>
            <v-chip
              v-for="character in evilCharacters"
              :key="character.id"
              color="error"
              variant="elevated"
              class="ma-1"
            >
              <v-icon start>{{ character.icon }}</v-icon>
              {{ t(`characters.${character.id}.name`) }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Speech Settings -->
    <v-row class="mt-4" v-if="speechSupported">
      <v-col cols="12">
        <v-card elevation="1">
          <v-card-title>
            <v-icon class="me-2">mdi-cog</v-icon>
            {{ t('gameMaster.speechSettings') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedLanguage"
                  :items="availableLanguages"
                  :label="t('gameMaster.filterByLanguage')"
                  variant="outlined"
                  density="compact"
                  clearable
                  :disabled="isPlaying"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedVoiceModel"
                  :items="filteredVoices"
                  :label="t('gameMaster.voice')"
                  variant="outlined"
                  density="compact"
                  :disabled="isPlaying"
                  :no-data-text="t('gameMaster.noVoicesMatch')"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="speechRateModel"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  :label="t('gameMaster.speed')"
                  thumb-label
                ></v-slider>
              </v-col>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="speechPitchModel"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  :label="t('gameMaster.pitch')"
                  thumb-label
                ></v-slider>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Game Script -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>
            <v-icon class="me-2">mdi-script-text</v-icon>
            {{ t('gameMaster.gameScript') }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(line, index) in gameScript"
                :key="index"
                :class="{
                  'bg-primary': currentStep === index,
                  'text-white': currentStep === index
                }"
                rounded
              >
                <template v-slot:prepend>
                  <v-avatar size="32" :color="currentStep === index ? 'white' : 'primary'">
                    <span :class="currentStep === index ? 'text-primary' : 'text-white'">
                      {{ index + 1 }}
                    </span>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="text-wrap">
                  {{ line }}
                </v-list-item-title>
                
                <template v-slot:append v-if="currentStep === index && isPlaying">
                  <v-icon color="white">mdi-volume-high</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Control Buttons -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="1" class="pa-4">
          <v-row>
            <v-col cols="12" sm="6">
              <v-btn
                v-if="!isPlaying"
                color="primary"
                variant="elevated"
                block
                size="large"
                @click="playScript"
                prepend-icon="mdi-play"
                :disabled="!speechSupported"
              >
                {{ t('gameMaster.startNarration') }}
              </v-btn>
              <v-btn
                v-else
                color="error"
                variant="elevated"
                block
                size="large"
                @click="stopScript"
                prepend-icon="mdi-stop"
              >
                {{ t('gameMaster.stopNarration') }}
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn
                color="grey"
                variant="outlined"
                block
                size="large"
                @click="emit('backToSelection')"
                prepend-icon="mdi-arrow-left"
              >
                {{ t('gameMaster.newGame') }}
              </v-btn>
            </v-col>
          </v-row>
          
          <v-alert
            v-if="!speechSupported"
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            <v-icon class="me-2">mdi-alert</v-icon>
            {{ t('gameMaster.speechNotSupported') }}
          </v-alert>
          
          <v-alert
            v-if="isPlaying"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            {{ t('gameMaster.narrationInProgress') }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-list-item {
  margin-bottom: 8px;
}

.text-wrap {
  white-space: normal;
  word-wrap: break-word;
}
</style>