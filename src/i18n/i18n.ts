import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Importamos los archivos de traducciones
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationNL from './locales/nl.json';
import translationPL from './locales/pl.json';

// Los recursos de traducción
const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  nl: {
    translation: translationNL,
  },
  pl: {
    translation: translationPL,
  },
};

i18n
  // Detectar el idioma del navegador
  .use(LanguageDetector)
  // Pasar el módulo i18n a react-i18next
  .use(initReactI18next)
  // Inicialización de i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    interpolation: {
      escapeValue: false, // React ya se encarga de esto
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
