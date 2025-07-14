import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import ConnectionStatus from '../../../components/ConnectionStatus/ConnectionStatus';
import i18n from '../../../i18n/i18n';

const meta: Meta<typeof ConnectionStatus> = {
  title: 'Components/ConnectionStatus',
  component: ConnectionStatus,
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Componente que muestra una notificación en la parte superior cuando el servicio no está disponible. Se adapta automáticamente al tema del sistema y soporta múltiples idiomas.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isConnected: {
      control: 'boolean',
      description: 'Indica si el servicio está conectado',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - Servicio desconectado
export const Disconnected: Story = {
  args: {
    isConnected: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Estado cuando el servicio no está disponible. La notificación se muestra en la parte superior.',
      },
    },
  },
};

// Historia - Servicio conectado (no se muestra nada)
export const Connected: Story = {
  args: {
    isConnected: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Estado cuando el servicio está conectado. El componente no renderiza nada.',
      },
    },
  },
};

// Historia con contenido de ejemplo para ver el efecto del padding
export const DisconnectedWithContent: Story = {
  args: {
    isConnected: false,
  },
  decorators: [
    (Story: any) => (
      <I18nextProvider i18n={i18n}>
        <div>
          <Story />
          <div
            style={{
              padding: '2rem',
              background: 'var(--background-color)',
              minHeight: '100vh',
            }}
          >
            <h1 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
              Contenido de ejemplo
            </h1>
            <p style={{ color: 'var(--text-color)', lineHeight: 1.6 }}>
              Este es contenido de ejemplo para demostrar cómo la notificación
              de conexión aparece en la parte superior sin ocultar el contenido
              principal. El componente añade automáticamente el padding
              necesario para evitar superposiciones y se adapta al idioma
              seleccionado.
            </p>
            <div
              style={{
                background: 'var(--card-bg)',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                border: '1px solid var(--border-color)',
              }}
            >
              <h3
                style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}
              >
                Tarjeta de ejemplo
              </h3>
              <p style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>
                Contenido de tarjeta para mostrar la integración con el sistema
                de temas.
              </p>
            </div>
          </div>
        </div>
      </I18nextProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Demostración del componente con contenido de página para ver cómo se integra visualmente y responde a los cambios de idioma.',
      },
    },
  },
};
