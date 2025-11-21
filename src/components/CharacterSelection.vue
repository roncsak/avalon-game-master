<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  AVALON_CHARACTERS, 
  GAME_MODULES,
  type Character,
  getPairedCharacter,
  validateCharacterSelection,
  getAvailableCharacters,
  validateModuleSelection,
  getMessengerCharacters
} from '../types/avalon'
import CharacterCard from './CharacterCard.vue'
import { useGameStore } from '../stores/gameStore'

const { t } = useI18n()
const emit = defineEmits<{
  charactersSelected: [characterIds: string[], modules: string[]]
}>()

const gameStore = useGameStore()

// Use store values but keep local refs for reactivity
const selectedCharacters = ref<string[]>([...gameStore.selectedCharacters])
const selectedModules = ref<string[]>([...gameStore.selectedModules])

// Watch for changes and sync with store
watch(selectedCharacters, (newVal) => {
  gameStore.setSelectedCharacters([...newVal])
}, { deep: true })

watch(selectedModules, (newVal) => {
  gameStore.setSelectedModules([...newVal])
}, { deep: true })

// Initialize from store on mount
onMounted(() => {
  selectedCharacters.value = [...gameStore.selectedCharacters]
  selectedModules.value = [...gameStore.selectedModules]
})

const availableCharacters = computed(() => 
  getAvailableCharacters(selectedModules.value)
)

const goodCharacters = computed(() => 
  availableCharacters.value.filter(c => c.alignment === 'good')
)
const evilCharacters = computed(() => 
  availableCharacters.value.filter(c => c.alignment === 'evil')
)

const selectedGoodCount = computed(() =>
  selectedCharacters.value.filter(id => {
    const character = AVALON_CHARACTERS.find(c => c.id === id)
    return character?.alignment === 'good'
  }).length
)

const selectedEvilCount = computed(() =>
  selectedCharacters.value.filter(id => {
    const character = AVALON_CHARACTERS.find(c => c.id === id)
    return character?.alignment === 'evil'
  }).length
)

const recommendedCounts = computed(() => {
  const counts = {
    5: { good: 3, evil: 2 },
    6: { good: 4, evil: 2 },
    7: { good: 4, evil: 3 },
    8: { good: 5, evil: 3 },
    9: { good: 6, evil: 3 },
    10: { good: 6, evil: 4 }
  }
  return counts[gameStore.playerCount as keyof typeof counts] || { good: 3, evil: 2 }
})

const isValidSelection = computed(() => {
  const recommended = recommendedCounts.value
  const basicCountsValid = selectedGoodCount.value === recommended.good && 
                          selectedEvilCount.value === recommended.evil
  
  // Check if all paired characters are properly selected
  const pairingValidation = validateCharacterSelection(selectedCharacters.value)
  
  return basicCountsValid && pairingValidation.isValid
})

const pairingValidation = computed(() => {
  return validateCharacterSelection(selectedCharacters.value)
})

const moduleValidation = computed(() => {
  return validateModuleSelection(selectedCharacters.value, selectedModules.value)
})

const addCharacter = (character: Character) => {
  const currentCount = selectedCharacters.value.filter(id => id === character.id).length
  if (currentCount < character.maxCount) {
    selectedCharacters.value.push(character.id)
    
    // Auto-add paired character if this character is paired
    if (character.isPaired && character.pairedWith) {
      const pairedCharacter = getPairedCharacter(character.id)
      if (pairedCharacter && !selectedCharacters.value.includes(pairedCharacter.id)) {
        selectedCharacters.value.push(pairedCharacter.id)
      }
    }
    
    // Auto-add all messenger characters if this is a messenger
    const messengerIds = getMessengerCharacters()
    if (messengerIds.includes(character.id)) {
      messengerIds.forEach(id => {
        if (!selectedCharacters.value.includes(id)) {
          selectedCharacters.value.push(id)
        }
      })
    }
  }
}

const removeCharacter = (character: Character) => {
  const index = selectedCharacters.value.indexOf(character.id)
  if (index !== -1) {
    selectedCharacters.value.splice(index, 1)
    
    // Auto-remove paired character if this character is paired
    if (character.isPaired && character.pairedWith) {
      const pairedCharacterIndex = selectedCharacters.value.indexOf(character.pairedWith)
      if (pairedCharacterIndex !== -1) {
        selectedCharacters.value.splice(pairedCharacterIndex, 1)
      }
    }
    
    // Auto-remove all messenger characters if this is a messenger
    const messengerIds = getMessengerCharacters()
    if (messengerIds.includes(character.id)) {
      messengerIds.forEach(id => {
        const messengerIndex = selectedCharacters.value.indexOf(id)
        if (messengerIndex !== -1) {
          selectedCharacters.value.splice(messengerIndex, 1)
        }
      })
    }
  }
}

// Toggle module selection
const toggleModule = (moduleId: string) => {
  if (moduleId === 'all') {
    // 'all' module cannot be disabled
    return
  }
  
  const index = selectedModules.value.indexOf(moduleId)
  if (index === -1) {
    // Enabling module - add it and remove incompatible characters
    selectedModules.value.push(moduleId)
    
    // Remove characters that are incompatible with this module
    const incompatibleChars = selectedCharacters.value.filter(charId => {
      const character = AVALON_CHARACTERS.find(c => c.id === charId)
      return character && 
             character.incompatibleWith !== 'none' && 
             character.incompatibleWith === moduleId
    })
    
    incompatibleChars.forEach(charId => {
      const index = selectedCharacters.value.indexOf(charId)
      if (index !== -1) {
        selectedCharacters.value.splice(index, 1)
      }
    })
  } else {
    // Disabling module - remove it and characters that require it
    selectedModules.value.splice(index, 1)
    
    // Remove characters that are no longer available
    const unavailableChars = selectedCharacters.value.filter(charId => {
      const character = AVALON_CHARACTERS.find(c => c.id === charId)
      return character && !selectedModules.value.includes(character.availability)
    })
    
    unavailableChars.forEach(charId => {
      const index = selectedCharacters.value.indexOf(charId)
      if (index !== -1) {
        selectedCharacters.value.splice(index, 1)
      }
    })
  }
}

const startGame = () => {
  if (isValidSelection.value) {
    emit('charactersSelected', selectedCharacters.value, selectedModules.value)
  }
}

const resetSelection = () => {
  gameStore.clearStorage()
  selectedCharacters.value = []
  selectedModules.value = ['all']
}
</script>

<template>
  <v-container fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="pa-4 text-center">
          <v-card-title class="text-h4">
            <v-icon class="me-2 text-primary">mdi-account-group</v-icon>
            Character Selection
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-4">Select characters for your Avalon game</p>
            
            <!-- Player Count Selector -->
            <v-row justify="center">
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="gameStore.playerCount"
                  :items="[5, 6, 7, 8, 9, 10]"
                  label="Number of Players"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-multiple"
                ></v-select>
              </v-col>
            </v-row>
            
            <!-- Selection Summary -->
            <v-row>
              <v-col cols="6">
                <v-chip 
                  :color="selectedGoodCount === recommendedCounts.good ? 'success' : 'warning'"
                  variant="elevated"
                  size="large"
                >
                  <v-icon start>mdi-shield-check</v-icon>
                  Good: {{ selectedGoodCount }}/{{ recommendedCounts.good }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <v-chip 
                  :color="selectedEvilCount === recommendedCounts.evil ? 'error' : 'warning'"
                  variant="elevated"
                  size="large"
                >
                  <v-icon start>mdi-skull</v-icon>
                  Evil: {{ selectedEvilCount }}/{{ recommendedCounts.evil }}
                </v-chip>
              </v-col>
            </v-row>
            
            <!-- Module Selection -->
            <v-row class="mt-4">
              <v-col cols="12">
                <h3 class="text-h6 mb-3">Game Modules</h3>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="module in GAME_MODULES"
                    :key="module.id"
                    :color="selectedModules.includes(module.id) ? 'primary' : 'default'"
                    :variant="selectedModules.includes(module.id) ? 'flat' : 'outlined'"
                    :disabled="module.id === 'all'"
                    clickable
                    @click="toggleModule(module.id)"
                    class="ma-1"
                  >
                    <v-icon start :icon="selectedModules.includes(module.id) ? 'mdi-check' : 'mdi-plus'" />
                    {{ module.name }}
                  </v-chip>
                </div>
                <p class="text-caption mt-2 text-medium-emphasis">
                  Enable modules to unlock additional characters. Standard module is always enabled.
                </p>
              </v-col>
            </v-row>
            
            <!-- Pairing Validation -->
            <v-row v-if="!pairingValidation.isValid">
              <v-col cols="12">
                <v-alert
                  type="warning"
                  variant="tonal"
                  class="text-center"
                >
                  <v-icon start>mdi-link-variant</v-icon>
                  {{ pairingValidation.message }}
                </v-alert>
              </v-col>
            </v-row>

            <!-- Module Validation -->
            <v-row v-if="!moduleValidation.isValid">
              <v-col cols="12">
                <v-alert
                  type="error"
                  variant="tonal"
                  class="text-center"
                >
                  <v-icon start>mdi-puzzle</v-icon>
                  {{ moduleValidation.message }}
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Good Characters -->
    <v-row class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-3 d-flex align-center">
          <v-icon class="me-2 text-success">mdi-shield-check</v-icon>
          Good Characters
        </h2>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col 
        v-for="character in goodCharacters"
        :key="character.name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <CharacterCard 
          :character="character"
          :selectedCharacters="selectedCharacters"
          @addCharacter="addCharacter"
          @removeCharacter="removeCharacter"
        />
      </v-col>
    </v-row>

    <!-- Evil Characters -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h2 class="text-h5 mb-3 d-flex align-center">
          <v-icon class="me-2 text-error">mdi-skull</v-icon>
          Evil Characters
        </h2>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col 
        v-for="character in evilCharacters"
        :key="character.name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <CharacterCard 
          :character="character"
          :selectedCharacters="selectedCharacters"
          @addCharacter="addCharacter"
          @removeCharacter="removeCharacter"
        />
      </v-col>
    </v-row>

    <!-- Action Buttons -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card elevation="1" class="pa-4">
          <v-row>
            <v-col cols="6">
              <v-btn
                color="grey"
                variant="outlined"
                block
                size="large"
                @click="resetSelection"
                prepend-icon="mdi-refresh"
              >
                Reset
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                color="primary"
                variant="elevated"
                block
                size="large"
                @click="startGame"
                :disabled="!isValidSelection"
                prepend-icon="mdi-play"
              >
                Start Game
              </v-btn>
            </v-col>
          </v-row>
          
          <v-alert
            v-if="!isValidSelection && selectedCharacters.length > 0"
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            Please select exactly {{ recommendedCounts.good }} good and {{ recommendedCounts.evil }} evil characters for {{ gameStore.playerCount }} players.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>