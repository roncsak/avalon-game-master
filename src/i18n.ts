import { createI18n } from 'vue-i18n'

// Define supported locales
export const SUPPORT_LOCALES = ['en', 'es', 'hu']

// Function to detect browser language
export function getBrowserLocale(): string {
  const navigatorLocale = 
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language

  if (!navigatorLocale) {
    return 'en'
  }

  // Get language code without country (e.g., 'en-US' -> 'en')
  const languageCode = navigatorLocale.split('-')[0]
  
  // Check if we support this language
  if (languageCode && SUPPORT_LOCALES.includes(languageCode)) {
    return languageCode
  }
  
  return 'en'
}

// Function to load locale messages dynamically
export function loadLocaleMessages(locale: string) {
  return import(`./locales/${locale}.json`).then((messages) => {
    return messages.default
  })
}

// Set up i18n instance
export async function setupI18n(options: { locale?: string } = {}) {
  // Use provided locale, stored locale, or browser detection, fallback to 'en'
  const locale = options.locale || getBrowserLocale()
  
  // Load the locale messages
  const messages = await loadLocaleMessages(locale)
  
  const i18n = createI18n({
    legacy: false, // Use Composition API
    locale,
    fallbackLocale: 'en',
    messages: {
      [locale]: messages
    }
  })

  return i18n
}

// Function to set locale dynamically
export async function setI18nLanguage(i18n: any, locale: string) {
  // Load the locale messages if not available
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await loadLocaleMessages(locale)
    i18n.global.setLocaleMessage(locale, messages)
  }
  
  // Set the locale for global i18n instance
  i18n.global.locale.value = locale
  
  // Set HTML lang attribute
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', locale)
  }
}