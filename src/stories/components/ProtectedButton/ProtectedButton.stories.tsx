import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import ProtectedButton from '../../../components/ProtectedButton/ProtectedButton';
import i18n from '../../../i18n/i18n';

const meta: Meta<typeof ProtectedButton> = {
  title: 'Components/ProtectedButton',
  component: ProtectedButton,
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div
          style={{
            padding: '2rem',
            background: 'var(--background-color)',
            minHeight: '100vh',
          }}
        >
          <Story />
        </div>
      </I18nextProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Botón que se deshabilita automáticamente cuando no hay conexión al servicio. Muestra indicadores visuales y tooltips informativos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'Variante visual del botón',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Tamaño del botón',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar el botón manualmente',
    },
    showTooltip: {
      control: 'boolean',
      description: 'Mostrar tooltip cuando no hay conexión',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal
export const Primary: Story = {
  args: {
    children: 'Crear Sala',
    variant: 'primary',
    size: 'medium',
    showTooltip: true,
    onClick: () => alert('¡Botón clickeado!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Botón primario que requiere conexión para funcionar.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    children: 'Unirse a Sala',
    variant: 'secondary',
    size: 'medium',
    showTooltip: true,
    onClick: () => alert('¡Botón clickeado!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Botón secundario con estilo alternativo.',
      },
    },
  },
};

export const Danger: Story = {
  args: {
    children: 'Eliminar Sala',
    variant: 'danger',
    size: 'medium',
    showTooltip: true,
    onClick: () => alert('¡Botón clickeado!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Botón de acción destructiva.',
      },
    },
  },
};

// Diferentes tamaños
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <ProtectedButton
        variant="primary"
        size="small"
        onClick={() => alert('Small!')}
      >
        Pequeño
      </ProtectedButton>
      <ProtectedButton
        variant="primary"
        size="medium"
        onClick={() => alert('Medium!')}
      >
        Mediano
      </ProtectedButton>
      <ProtectedButton
        variant="primary"
        size="large"
        onClick={() => alert('Large!')}
      >
        Grande
      </ProtectedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Diferentes tamaños disponibles para el botón protegido.',
      },
    },
  },
};

// Todas las variantes
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <ProtectedButton variant="primary" onClick={() => alert('Primary!')}>
        Primario
      </ProtectedButton>
      <ProtectedButton variant="secondary" onClick={() => alert('Secondary!')}>
        Secundario
      </ProtectedButton>
      <ProtectedButton variant="danger" onClick={() => alert('Danger!')}>
        Peligro
      </ProtectedButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Todas las variantes de color disponibles.',
      },
    },
  },
};

// Botón deshabilitado manualmente
export const ManuallyDisabled: Story = {
  args: {
    children: 'Botón Deshabilitado',
    variant: 'primary',
    disabled: true,
    onClick: () => alert('No debería funcionar'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Botón deshabilitado manualmente (independiente del estado de conexión).',
      },
    },
  },
};

// Simulación de estado desconectado
export const DisconnectedSimulation: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
    >
      <p style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
        <strong>Nota:</strong> En esta simulación, todos los botones aparecen
        como si el servicio estuviera desconectado. En la aplicación real, el
        estado depende de la conexión del socket.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="protected-button-wrapper">
          <button
            className="protected-button protected-button--primary protected-button--medium protected-button--disconnected"
            disabled
          >
            <span className="protected-button__connection-icon">⚠️</span>
            Crear Sala
          </button>
        </div>
        <div className="protected-button-wrapper">
          <button
            className="protected-button protected-button--secondary protected-button--medium protected-button--disconnected"
            disabled
          >
            <span className="protected-button__connection-icon">⚠️</span>
            Unirse a Sala
          </button>
        </div>
        <div className="protected-button-wrapper">
          <button
            className="protected-button protected-button--danger protected-button--medium protected-button--disconnected"
            disabled
          >
            <span className="protected-button__connection-icon">⚠️</span>
            Eliminar Sala
          </button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Simulación visual de cómo se ven los botones cuando no hay conexión al servicio.',
      },
    },
  },
};
