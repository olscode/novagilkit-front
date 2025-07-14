import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-onboarding',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  // Especificamos que use el archivo preview.tsx en lugar de preview.ts
  previewHead: (head) => `
    ${head}
    <script>
      // Ensure i18n is initialized before rendering stories
      window.STORYBOOK_REACT_LOCALE = localStorage.getItem('i18nextLng') || 'es';
    </script>
  `,
};
export default config;
