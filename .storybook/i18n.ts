import i18n from '../src/i18n/i18n';

// Asegúrate de que i18n se inicialice correctamente
if (!i18n.isInitialized) {
  console.warn('i18n no se ha inicializado correctamente en Storybook');
}

export default i18n;
