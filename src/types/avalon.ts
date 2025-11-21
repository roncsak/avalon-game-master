// Avalon character types and data

export interface Appearance {
    appears: 'good' | 'evil' | string // character ID
    to: 'good' | 'evil' | string // character ID
}

// Game Modules
export interface GameModule {
  id: string
  name: string
  description: string
}

export const GAME_MODULES: GameModule[] = [
  {
    id: 'all',
    name: 'Standard',
    description: 'Standard Avalon characters available in all games'
  },
  {
    id: 'lancelot',
    name: 'Unknown Lancelots (variant)',
    description: 'Adds Lancelot characters with special switching abilities'
  },
  {
    id: 'morgana-assassin',
    name: 'Assassin Morgana (variant)',
    description: 'Removes the Assassin and gives Morgana the ability to assassinate Merlin'
  },
  {
    id: 'rogue',
    name: 'Rogue module',
    description: 'Adds Rogue characters with special success/failure abilities'
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer module', 
    description: 'Adds Sorcerer characters with magic abilities'
  },
  {
    id: 'messengers',
    name: 'Messengers module',
    description: 'Adds Messenger characters with communication abilities'
  }
]

export interface Character {
  id: string
  name: string
  alignment: 'good' | 'evil'
  knows: 'none' | 'good' | 'evil' | string // character ID
  appearance?: Appearance[]
  investigatesFirstLeader?: boolean
  description: string
  icon: string
  maxCount: number
  isPaired?: boolean
  pairedWith?: string // character ID
  pairId?: string
  availability: 'all' | 'lancelot' | 'rogue' | 'sorcerer' | 'messengers' | 'morgana-assassin',
  incompatibleWith: 'none' | 'lancelot' | 'rogue' | 'sorcerer' | 'messengers' | 'morgana-assassin'
}

export const AVALON_CHARACTERS: Character[] = [
  // Good Characters
  {
    id: 'merlin',
    name: 'Merlin',
    alignment: 'good',
    knows: 'evil',
    description: 'Knows Evil. Must remain hidden.',
    icon: 'mdi-wizard-hat',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'percival',
    name: 'Percival',
    alignment: 'good',
    knows: 'merlin',
    description: 'Knows Merlin',
    icon: 'mdi-shield-account',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'loyal-servant',
    name: 'Loyal Servant of Arthur',
    alignment: 'good',
    knows: 'none',
    description: 'Basic good character with no special abilities',
    icon: 'mdi-account-heart',
    maxCount: 4,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'troublemaker',
    name: 'Troublemaker',
    alignment: 'good',
    knows: 'none',
    description: 'Must lie about loyalty',
    icon: 'mdi-account-question',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'cleric',
    name: 'Cleric',
    alignment: 'good',
    knows: 'none',
    description: 'Secretly investigate the first Leader',
    investigatesFirstLeader: true,
    icon: 'mdi-cross',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'untrustworthy-servant',
    name: 'Untrustworthy Servant',
    alignment: 'good',
    knows: 'assassin',
    appearance: [{ appears: 'evil', to: 'merlin' }],
    description: 'Appears Evil to Merlin. Knows the Assassin. Cannot play Quest Fail card. Can become Evil during the Recruitment phase.',
    icon: 'mdi-account-alert',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'morgana-assassin'
  },
  {
    id: 'untrustworthy-servant-assassin',
    name: 'Untrustworthy Servant',
    alignment: 'good',
    knows: 'morgana-assassin',
    appearance: [{ appears: 'evil', to: 'merlin' }],
    description: 'Appears Evil to Merlin. Knows Morgana. Cannot play Quest Fail card. Can become Evil during the Recruitment phase.',
    icon: 'mdi-account-alert',
    maxCount: 1,
    availability: 'morgana-assassin',
    incompatibleWith: 'none'
  },
  
  // Paired Characters - Good versions
  {
    id: 'good-lancelot',
    name: 'Good Lancelot',
    alignment: 'good',
    knows: 'evil-lancelot',
    description: 'Knows Evil lancelot, or can switch allegiance.',
    icon: 'mdi-shield-check',
    maxCount: 1,
    isPaired: true,
    pairedWith: 'evil-lancelot',
    pairId: 'lancelots',
    availability: 'all',
    incompatibleWith: 'lancelot'
  },
  {
    id: 'good-lancelot-unknown',
    name: 'Good Lancelot',
    alignment: 'good',
    knows: 'none',
    description: 'Can switch allegiance.',
    icon: 'mdi-shield-check',
    maxCount: 1,
    isPaired: true,
    pairedWith: 'evil-lancelot-unknown',
    pairId: 'unknown-lancelots',
    availability: 'lancelot',
    incompatibleWith: 'none'
  },
  {
    id: 'good-rogue',
    name: 'Good Rogue',
    alignment: 'good',
    knows: 'none',
    description: 'May play Rogue Success.',
    icon: 'mdi-magnify',
    maxCount: 1,
    availability: 'rogue',
    incompatibleWith: 'none'
  },
  {
    id: 'good-sorcerer',
    name: 'Good Sorcerer',
    alignment: 'good',
    knows: 'none',
    description: 'May play Magic.',
    icon: 'mdi-shield-check',
    maxCount: 1,
    isPaired: true,
    pairedWith: 'evil-sorcerer',
    pairId: 'sorcerers',
    availability: 'sorcerer',
    incompatibleWith: 'none'
  },
  
  // Evil Characters
  {
    id: 'assassin',
    name: 'Assassin',
    alignment: 'evil',
    knows: 'evil',
    description: 'May activate Assassination stage if three Quests succeed.',
    icon: 'mdi-knife-military',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'morgana-assassin'
  },
  {
    id: 'morgana',
    name: 'Morgana',
    alignment: 'evil',
    knows: 'evil',
    appearance: [{ appears: 'merlin', to: 'percival' }],
    description: 'Appears as Merlin.',
    icon: 'mdi-magic-staff',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'morgana-assassin'
  },
  {
    id: 'morgana-assassin',
    name: 'Morgana',
    alignment: 'evil',
    knows: 'evil',
    appearance: [{ appears: 'merlin', to: 'percival' }],
    description: 'Appears as Merlin. May activate Assassination stage if three Quests succeed.',
    icon: 'mdi-magic-staff',
    maxCount: 1,
    availability: 'morgana-assassin',
    incompatibleWith: 'none'
  },
  {
    id: 'mordred',
    name: 'Mordred',
    alignment: 'evil',
    knows: 'evil',
    appearance: [{ appears: 'good', to: 'merlin' }],
    description: 'Unknown to Merlin.',
    icon: 'mdi-sword-cross',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'oberon',
    name: 'Oberon',
    alignment: 'evil',
    knows: 'none',
    appearance: [{ appears: 'good', to: 'evil' }],
    description: 'Unknown to Evil. Does not know Evil.',
    icon: 'mdi-eye-off',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'minion-of-mordred',
    name: 'Minion of Mordred',
    alignment: 'evil',
    knows: 'evil',
    description: 'Basic evil character.',
    icon: 'mdi-account-remove',
    maxCount: 3,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'trickster',
    name: 'Trickster',
    alignment: 'evil',
    knows: 'evil',
    description: 'May lie about loyalty.',
    icon: 'mdi-drama-masks',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'lunatic',
    name: 'Lunatic',
    alignment: 'evil',
    knows: 'evil',
    description: 'Must Fail every Quest.',
    icon: 'mdi-emoticon-devil',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'brute',
    name: 'Brute',
    alignment: 'evil',
    knows: 'evil',
    description: 'May Fail only the first three Quests.',
    icon: 'mdi-account-hard-hat',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  {
    id: 'revealer',
    name: 'Revealer',
    alignment: 'evil',
    knows: 'evil',
    description: 'Reveals loyalty after second failed Quest.',
    icon: 'mdi-eye-outline',
    maxCount: 1,
    availability: 'all',
    incompatibleWith: 'none'
  },
  
  // Paired Characters - Evil versions
  {
    id: 'evil-lancelot',
    name: 'Evil Lancelot',
    alignment: 'evil',
    knows: 'evil',
    description: 'Knows Good Lancelot, or can switch allegiance.',
    icon: 'mdi-bomb',
    maxCount: 1,
    isPaired: true,
    pairedWith: 'good-lancelot',
    pairId: 'lancelots',
    availability: 'all',
    incompatibleWith: 'lancelot'
  },
  {
    id: 'evil-lancelot-unknown',
    name: 'Evil Lancelot',
    alignment: 'evil',
    knows: 'none',
    description: 'Can switch allegiance.',
    icon: 'mdi-bomb',
    maxCount: 1,
    isPaired: true,
    pairedWith: 'good-lancelot-unknown',
    pairId: 'unknown-lancelots',
    availability: 'lancelot',
    incompatibleWith: 'none'
  },
  {
    id: 'evil-rogue',
    name: 'Evil Rogue',
    alignment: 'evil',
    knows: 'none',
    appearance: [{ appears: 'good', to: 'evil' }],
    description: 'May play Rogue Fail. Unknown to Evil. Does not know Evil.',
    icon: 'mdi-incognito',
    maxCount: 1,
    availability: 'rogue',
    incompatibleWith: 'none'
  },
  
  // Paired Characters - Evil versions
  {
    id: 'evil-sorcerer',
    name: 'Evil Sorcerer',
    alignment: 'evil',
    knows: 'evil',
    description: 'May play Magic. May not play Fail.',
    icon: 'mdi-bomb',
    maxCount: 1,
    isPaired: true,
    pairedWith: 'good-sorcerer',
    pairId: 'sorcerers',
    availability: 'sorcerer',
    incompatibleWith: 'none'
  },
  
  // Messenger Characters
  {
    id: 'messenger',
    name: 'EvilMessenger',
    alignment: 'evil',
    knows: 'evil',
    description: 'May play Evil Message',
    icon: 'mdi-message-alert',
    maxCount: 1,
    availability: 'messengers',
    incompatibleWith: 'none'
  },
  {
    id: 'senior-messenger',
    name: 'Senior Messenger',
    alignment: 'good',
    knows: 'junior-messenger',
    description: 'Knows Junior Messenger. May play Good Message.',
    icon: 'mdi-message-reply',
    maxCount: 1,
    availability: 'messengers',
    incompatibleWith: 'none'
  },
  {
    id: 'junior-messenger',
    name: 'Junior Messenger',
    alignment: 'good',
    knows: 'none',
    description: 'May play Good Message.',
    icon: 'mdi-message-text',
    maxCount: 1,
    availability: 'messengers',
    incompatibleWith: 'none'
  }
]

// Helper functions for messenger characters
export const getMessengerCharacters = (): string[] => {
  return ['messenger', 'senior-messenger', 'junior-messenger']
}

export const hasAnyMessengerSelected = (selectedCharacterIds: string[]): boolean => {
  const messengerIds = getMessengerCharacters()
  return messengerIds.some(id => selectedCharacterIds.includes(id))
}

export const hasAllMessengersSelected = (selectedCharacterIds: string[]): boolean => {
  const messengerIds = getMessengerCharacters()
  return messengerIds.every(id => selectedCharacterIds.includes(id))
}

export const getMissingMessengers = (selectedCharacterIds: string[]): string[] => {
  if (!hasAnyMessengerSelected(selectedCharacterIds)) return []
  const messengerIds = getMessengerCharacters()
  return messengerIds.filter(id => !selectedCharacterIds.includes(id))
}

// Helper functions for paired characters
export const getPairedCharacter = (characterId: string): Character | undefined => {
  const character = AVALON_CHARACTERS.find(c => c.id === characterId)
  if (!character?.isPaired || !character.pairedWith) return undefined
  return AVALON_CHARACTERS.find(c => c.id === character.pairedWith)
}

export const isPairedCharacterSelected = (characterId: string, selectedCharacterIds: string[]): boolean => {
  const pairedCharacter = getPairedCharacter(characterId)
  if (!pairedCharacter) return false
  return selectedCharacterIds.includes(pairedCharacter.id)
}

export const getRequiredPairings = (selectedCharacterIds: string[]): string[] => {
  const requiredPairs: string[] = []
  
  selectedCharacterIds.forEach(charId => {
    const character = AVALON_CHARACTERS.find(c => c.id === charId)
    if (character?.isPaired && character.pairedWith) {
      const pairedCharacterId = character.pairedWith
      if (!selectedCharacterIds.includes(pairedCharacterId)) {
        requiredPairs.push(pairedCharacterId)
      }
    }
  })
  
  return requiredPairs
}

export const validateCharacterSelection = (selectedCharacterIds: string[]): {
  isValid: boolean
  missingPairs: string[]
  missingMessengers: string[]
  message?: string
} => {
  const missingPairs = getRequiredPairings(selectedCharacterIds)
  const missingMessengers = getMissingMessengers(selectedCharacterIds)
  const allMissing = [...missingPairs, ...missingMessengers]
  
  if (allMissing.length > 0) {
    let message = ''
    
    if (missingPairs.length > 0) {
      const missingPairNames = missingPairs.map(id => {
        const character = AVALON_CHARACTERS.find(c => c.id === id)
        return character?.name || id
      })
      message += `Missing required paired characters: ${missingPairNames.join(', ')}`
    }
    
    if (missingMessengers.length > 0) {
      const missingMessengerNames = missingMessengers.map(id => {
        const character = AVALON_CHARACTERS.find(c => c.id === id)
        return character?.name || id
      })
      if (message) message += '. '
      message += `All Messengers must be selected together. Missing: ${missingMessengerNames.join(', ')}`
    }
    
    return {
      isValid: false,
      missingPairs,
      missingMessengers,
      message
    }
  }
  
  return {
    isValid: true,
    missingPairs: [],
    missingMessengers: []
  }
}

// Module helper functions
export const getAvailableCharacters = (enabledModules: string[]): Character[] => {
  return AVALON_CHARACTERS.filter(character => {
    // Must be available in one of the enabled modules
    const isAvailable = enabledModules.includes(character.availability)
    
    // Must not be incompatible with any enabled modules
    const isCompatible = character.incompatibleWith === 'none' || 
                        !enabledModules.includes(character.incompatibleWith)
    
    return isAvailable && isCompatible
  })
}

export const validateModuleSelection = (selectedCharacterIds: string[], enabledModules: string[]): {
  isValid: boolean
  unavailableCharacters: string[]
  incompatibleCharacters: string[]
  message?: string
} => {
  const unavailableCharacters = selectedCharacterIds.filter(charId => {
    const character = AVALON_CHARACTERS.find(c => c.id === charId)
    return character && !enabledModules.includes(character.availability)
  })
  
  const incompatibleCharacters = selectedCharacterIds.filter(charId => {
    const character = AVALON_CHARACTERS.find(c => c.id === charId)
    return character && 
           character.incompatibleWith !== 'none' && 
           enabledModules.includes(character.incompatibleWith)
  })
  
  const allIssues = [...unavailableCharacters, ...incompatibleCharacters]
  
  if (allIssues.length > 0) {
    let message = ''
    if (unavailableCharacters.length > 0) {
      const unavailableNames = unavailableCharacters.map(id => {
        const character = AVALON_CHARACTERS.find(c => c.id === id)
        return character?.name || id
      })
      message += `Characters requiring disabled modules: ${unavailableNames.join(', ')}`
    }
    if (incompatibleCharacters.length > 0) {
      const incompatibleNames = incompatibleCharacters.map(id => {
        const character = AVALON_CHARACTERS.find(c => c.id === id)
        return character?.name || id
      })
      if (message) message += '. '
      message += `Characters incompatible with enabled modules: ${incompatibleNames.join(', ')}`
    }
    
    return {
      isValid: false,
      unavailableCharacters,
      incompatibleCharacters,
      message
    }
  }
  
  return {
    isValid: true,
    unavailableCharacters: [],
    incompatibleCharacters: []
  }
}

export const INITIAL_SPEECH = "Everyone close your eyes and extend your hand into a fist in front of you."