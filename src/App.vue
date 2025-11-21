<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CharacterSelection from './components/CharacterSelection.vue'
import GameMaster from './components/GameMaster.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import { useGameStore } from './stores/gameStore'

const { t } = useI18n()
const drawer = ref(false)
const gameStore = useGameStore()

const navigationItems = computed(() => [
  { title: t('characterSelection.title'), icon: 'mdi-account-group', value: 'characters' },
  { title: t('gameMaster.title'), icon: 'mdi-microphone', value: 'gamemaster' },
  { title: 'Rules', icon: 'mdi-book-open', value: 'rules' },
])

const handleNavigation = (view: 'characters' | 'gamemaster' | 'rules') => {
  gameStore.setCurrentView(view)
  drawer.value = false
}
</script>

<template>
  <v-app>
    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          prepend-icon="mdi-shield-sword"
          :title="t('app.title')"
          :subtitle="t('app.subtitle')"
        ></v-list-item>
      </v-list>
      
      <v-divider></v-divider>
      
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.value"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          @click="handleNavigation(item.value as 'characters' | 'gamemaster' | 'rules')"
          :active="gameStore.currentView === item.value"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar
      color="primary"
      density="compact"
      elevation="1"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="d-sm-none"
      ></v-app-bar-nav-icon>
      
      <v-app-bar-title class="d-flex align-center">
        <span class="d-none d-sm-flex">{{ t('app.title') }}</span>
        <span class="d-sm-none">{{ t('app.title') }}</span>
      </v-app-bar-title>
      
      <!-- Desktop navigation -->
      <template v-slot:append>
        <div class="d-none d-sm-flex align-center">
          <v-btn
            v-for="item in navigationItems"
            :key="item.value"
            variant="text"
            :prepend-icon="item.icon"
            size="small"
            class="mx-1"
            @click="gameStore.setCurrentView(item.value as 'characters' | 'gamemaster' | 'rules')"
            :active="gameStore.currentView === item.value"
          >
            {{ item.title }}
          </v-btn>
          
          <v-divider vertical class="mx-2"></v-divider>
          <LanguageSelector />
        </div>
        
        <!-- Mobile language selector -->
        <div class="d-sm-none">
          <LanguageSelector />
        </div>
      </template>
    </v-app-bar>
    
    <v-main>
      <v-container fluid class="pa-0">
        <div class="pa-3 pa-sm-6">
          <!-- Character Selection View -->
          <CharacterSelection 
            v-if="gameStore.currentView === 'characters'"
            @characters-selected="gameStore.handleCharactersSelected"
          />
          
          <!-- Game Master View -->
          <GameMaster 
            v-if="gameStore.currentView === 'gamemaster'"
            :selected-characters="gameStore.selectedCharacters"
            @back-to-selection="gameStore.setCurrentView('characters')"
          />
          
          <!-- Rules View -->
          <div v-if="gameStore.currentView === 'rules'" class="text-center">
            <v-card elevation="2" class="pa-6">
              <v-card-title class="text-h4 mb-4">
                <v-icon class="me-2">mdi-book-open</v-icon>
                Avalon Rules
              </v-card-title>
              <v-card-text>
                <p>Rules and game instructions will be available here.</p>
                <v-btn
                  color="primary"
                  @click="gameStore.setCurrentView('characters')"
                  prepend-icon="mdi-arrow-left"
                >
                  Back to Character Selection
                </v-btn>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-container>
    </v-main>

    <!-- Bottom Navigation for mobile -->
    <v-bottom-navigation
      v-model="gameStore.currentView"
      class="d-sm-none"
      color="primary"
      grow
    >
      <v-btn
        v-for="item in navigationItems"
        :key="item.value"
        :value="item.value"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.v-application {
  line-height: 1.4;
}
</style>
