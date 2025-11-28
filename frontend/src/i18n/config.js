import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import swTranslations from './locales/sw.json';
import frTranslations from './locales/fr.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  sw: {
    translation: swTranslations
  },
  fr: {
    translation: frTranslations
  },
  ar: {
    translation: arTranslations
  }
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language preference
      caches: ['localStorage'],
      // Look for language in localStorage
      lookupLocalStorage: 'i18nextLng'
    },

    react: {
      useSuspense: false // Disable suspense for better compatibility
    }
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
    // Fallback to English if i18n fails
    document.documentElement.lang = 'en';
  });

export default i18n;

