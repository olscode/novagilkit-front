import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import ProtectedCard from '../../../components/ProtectedCard/ProtectedCard';
import i18n from '../../../i18n/i18n';

const meta: Meta<typeof ProtectedCard> = {
  title: 'Components/ProtectedCard',
  component: ProtectedCard,
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div
          style={{
            padding: '2rem',
            background: 'var(--background-color)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          'Tarjeta interactiva que se deshabilita automáticamente cuando no hay conexión al servicio. Mantiene el diseño original elegante con funcionalidad de protección.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Icono emoji para la tarjeta',
    },
    title: {
      control: 'text',
      description: 'Título de la tarjeta',
    },
    description: {
      control: 'text',
      description: 'Descripción de la funcionalidad',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Variante visual de la tarjeta',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar la tarjeta manualmente',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - Crear sala
export const CreateRoom: Story = {
  args: {
    icon: '✨',
    title: 'Crear Sala',
    description:
      'Configura una sala de Poker Planning para estimar tareas con tu equipo',
    variant: 'primary',
    onClick: () => alert('¡Navegando a crear sala!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tarjeta para crear una nueva sala de Poker Planning.',
      },
    },
  },
};

// Historia - Unirse a sala
export const JoinRoom: Story = {
  args: {
    icon: '🚪',
    title: 'Unirse a Sala',
    description:
      'Ingresa el código de la sala y tu nombre de usuario para unirte a una sesión existente',
    variant: 'secondary',
    onClick: () => alert('¡Navegando a unirse a sala!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tarjeta para unirse a una sala existente de Poker Planning.',
      },
    },
  },
};

// Ambas variantes juntas
export const BothVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <ProtectedCard
        icon="✨"
        title="Crear Sala"
        description="Configura una sala de Poker Planning para estimar tareas con tu equipo"
        variant="primary"
        onClick={() => alert('¡Crear sala!')}
      />
      <ProtectedCard
        icon="🚪"
        title="Unirse a Sala"
        description="Ingresa el código de la sala y tu nombre de usuario para unirte a una sesión existente"
        variant="secondary"
        onClick={() => alert('¡Unirse a sala!')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Ambas variantes de tarjetas mostradas juntas como en la página principal.',
      },
    },
  },
};

// Tarjeta deshabilitada manualmente
export const DisabledCard: Story = {
  args: {
    icon: '🔒',
    title: 'Funcionalidad Bloqueada',
    description: 'Esta funcionalidad está temporalmente deshabilitada',
    variant: 'primary',
    disabled: true,
    onClick: () => alert('No debería funcionar'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tarjeta deshabilitada manualmente (independiente del estado de conexión).',
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
        alignItems: 'center',
      }}
    >
      <p
        style={{
          color: 'var(--text-color)',
          marginBottom: '1rem',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        <strong>Nota:</strong> En esta simulación, la tarjeta aparece como si el
        servicio estuviera desconectado. Pasa el mouse sobre la tarjeta para ver
        el overlay de advertencia.
      </p>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="protected-card protected-card--primary protected-card--disconnected">
          <div className="protected-card__overlay">
            <div className="protected-card__warning">
              <div className="protected-card__warning-icon">⚠️</div>
              <div className="protected-card__warning-text">
                Servicio no disponible
              </div>
            </div>
          </div>
          <div className="protected-card__content">
            <div className="protected-card__icon">✨</div>
            <div className="protected-card__title">Crear Sala</div>
            <div className="protected-card__description">
              Configura una sala de Poker Planning para estimar tareas con tu
              equipo
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Simulación visual de cómo se ve la tarjeta cuando no hay conexión al servicio. El overlay aparece al hacer hover.',
      },
    },
  },
};

// Diferentes iconos y contenidos
export const VariousIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        width: '100%',
      }}
    >
      <ProtectedCard
        icon="🎯"
        title="Estimación Rápida"
        description="Realiza estimaciones ágiles con tu equipo de desarrollo"
        variant="primary"
        onClick={() => alert('¡Estimación rápida!')}
      />
      <ProtectedCard
        icon="📊"
        title="Análisis de Resultados"
        description="Revisa y analiza las estimaciones realizadas por el equipo"
        variant="secondary"
        onClick={() => alert('¡Análisis!')}
      />
      <ProtectedCard
        icon="👥"
        title="Gestión de Equipo"
        description="Administra los miembros del equipo y sus permisos"
        variant="primary"
        onClick={() => alert('¡Gestión de equipo!')}
      />
      <ProtectedCard
        icon="⚙️"
        title="Configuración"
        description="Ajusta las configuraciones de las sesiones de estimación"
        variant="secondary"
        onClick={() => alert('¡Configuración!')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Ejemplos de tarjetas con diferentes iconos y contenidos para mostrar la versatilidad del componente.',
      },
    },
  },
};
