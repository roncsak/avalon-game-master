<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Character } from '../types/avalon'
import { AVALON_CHARACTERS, getMessengerCharacters } from '../types/avalon'

const { t, locale } = useI18n()

const props = defineProps<{
  character: Character
  selectedCharacters: string[] // Now contains character IDs
}>()

const emit = defineEmits<{
  addCharacter: [character: Character]
  removeCharacter: [character: Character]
}>()

const getCharacterCount = computed(() => {
  return props.selectedCharacters.filter(id => id === props.character.id).length
})

const getCharacterColor = computed(() => {
  if (props.character.alignment === 'good') return 'success'
  return 'error'
})

const getCharacterVariant = computed(() => {
  const count = getCharacterCount.value
  if (count > 0) return 'elevated'
  return 'outlined'
})

const getPairedCharacterName = computed(() => {
  if (!props.character.pairedWith) return null
  const pairedCharacter = AVALON_CHARACTERS.find(c => c.id === props.character.pairedWith)
  return pairedCharacter?.id || props.character.pairedWith
})

const isMessengerCharacter = computed(() => {
  const messengerIds = getMessengerCharacters()
  return messengerIds.includes(props.character.id)
})

const addCharacter = () => {
  const currentCount = getCharacterCount.value
  if (currentCount < props.character.maxCount) {
    emit('addCharacter', props.character)
  }
}

const removeCharacter = () => {
  emit('removeCharacter', props.character)
}
</script>

<template>
  <v-card
    :color="getCharacterColor"
    :variant="getCharacterVariant"
    class="h-100 character-card"
    hover
  >
    <v-card-text class="text-center pa-4">
      <div class="position-relative">
        <v-avatar 
          size="64" 
          :color="getCharacterCount > 0 ? 'white' : getCharacterColor"
          class="mb-3"
        >
          <v-icon 
            size="32" 
            :color="getCharacterCount > 0 ? getCharacterColor : 'white'"
          >
            {{ character.icon }}
          </v-icon>
        </v-avatar>
        
        <!-- Count badge -->
        <v-badge
          v-if="getCharacterCount > 0"
          :content="getCharacterCount"
          :color="getCharacterColor"
          class="character-count-badge"
        ></v-badge>
      </div>
      
      <h3 class="text-h6 mb-2" :class="getCharacterCount > 0 ? 'text-white' : ''">
        {{ t(`characters.${character.id}.name`) }}
        <span v-if="locale !== 'en'" class="text-caption d-block text-white-darken-1">
          ({{ t(`characters.${character.id}.name`, {}, { locale: 'en' }) }})
        </span>
      </h3>
      
      <p class="text-body-2" :class="getCharacterCount > 0 ? 'text-grey-lighten-2' : 'text-grey'">
        {{ t(`characters.${character.id}.description`) }}
      </p>
      
      <!-- Max count indicator -->
      <v-chip
        v-if="character.maxCount > 1"
        size="small"
        variant="outlined"
        :color="getCharacterColor"
        class="mt-2"
      >
        {{ t('characterCard.maxCount', { count: character.maxCount }) }}
      </v-chip>
      
      <!-- Pairing indicator -->
      <v-chip
        v-if="character.isPaired"
        size="small"
        variant="outlined"
        color="purple"
        class="mt-2"
      >
        <v-icon start size="16">mdi-link-variant</v-icon>
        {{ t('characterCard.pairedWith') }} {{ t(`characters.${getPairedCharacterName}.name`) }}
      </v-chip>
      
      <!-- Messenger indicator -->
      <v-chip
        v-if="isMessengerCharacter"
        size="small"
        variant="outlined"
        color="orange"
        class="mt-2"
      >
        <v-icon start size="16">mdi-message-settings</v-icon>
        {{ t('characterCard.messengerGroup') }}
      </v-chip>
    </v-card-text>
    
    <v-card-actions class="justify-center">
      <template v-if="character.maxCount === 1">
        <!-- Single instance character -->
        <v-btn
          v-if="getCharacterCount === 0"
          :color="getCharacterColor"
          variant="outlined"
          @click.stop="addCharacter"
          :title="t('characterCard.selectCharacter')"
        >
          {{ t('characterCard.select') }}
        </v-btn>
        <v-btn
          v-else
          color="white"
          variant="elevated"
          @click.stop="removeCharacter"
          :title="t('characterCard.removeCharacter')"
        >
          {{ t('characterCard.remove') }}
        </v-btn>
      </template>
      <template v-else>
        <!-- Multi-instance character -->
        <template v-if="getCharacterCount > 0">
          <v-btn
            size="small"
            color="white"
            variant="elevated"
            icon="mdi-minus"
            @click.stop="removeCharacter"
            class="me-2"
            :title="t('characterCard.removeOne')"
          ></v-btn>
          <v-btn
            size="small"
            color="white"
            variant="elevated"
            icon="mdi-plus"
            @click.stop="addCharacter"
            :disabled="getCharacterCount >= character.maxCount"
            :title="t('characterCard.addOne')"
          ></v-btn>
        </template>
        <template v-else>
          <v-btn
            :color="getCharacterColor"
            variant="outlined"
            @click.stop="addCharacter"
            :title="t('characterCard.addFirst')"
          >
            {{ t('characterCard.add') }}
          </v-btn>
        </template>
      </template>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.character-card {
  transition: all 0.3s ease;
}

.character-count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
}
</style>