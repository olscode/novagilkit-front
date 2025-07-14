import type { Decorator, Preview } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import '../src/App.scss'; // Importamos las variables CSS del sistema de temas
import i18n from '../src/i18n/i18n';
import '../src/index.scss'; // Importamos los estilos globales

// Establecemos un idioma predeterminado para Storybook (español)
i18n.changeLanguage('es');

// Decorador para el sistema de temas
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';

  // Aplicamos el tema al documento
  document.documentElement.setAttribute('data-theme', theme);

  // También aplicamos el tema al body para asegurar que se propague
  document.body.setAttribute('data-theme', theme);

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: '100vh',
        background: 'var(--background-color)',
        color: 'var(--text-color)',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <Story />
    </div>
  );
};

// Decorador global para proporcionar el contexto i18n a todas las historias
const withI18n: Decorator = (Story) => (
  <I18nextProvider i18n={i18n}>
    <Story />
  </I18nextProvider>
);

const preview: Preview = {
  decorators: [withTheme, withI18n],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Deshabilitamos los backgrounds por defecto ya que usamos nuestro sistema de temas
    },
  },
};

export default preview;
