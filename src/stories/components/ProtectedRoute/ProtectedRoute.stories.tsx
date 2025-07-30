import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router';
import ProtectedRoute from '../../../components/ProtectedRoute/ProtectedRoute';
import i18n from '../../../i18n/i18n';

const meta: Meta<typeof ProtectedRoute> = {
  title: 'Components/ProtectedRoute',
  component: ProtectedRoute,
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </I18nextProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Componente que protege rutas verificando la conexión del socket. Puede redirigir o mostrar un mensaje cuando no hay conexión.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showMessage: {
      control: 'boolean',
      description: 'Mostrar mensaje en lugar de redirigir',
    },
    redirectTo: {
      control: 'text',
      description: 'Ruta a la que redirigir si no hay conexión',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia con mensaje
export const WithMessage: Story = {
  args: {
    showMessage: true,
    children: (
      <div
        style={{
          padding: '2rem',
          background: 'var(--card-bg)',
          borderRadius: '8px',
        }}
      >
        <h2 style={{ color: 'var(--text-color)' }}>Contenido Protegido</h2>
        <p style={{ color: 'var(--text-color)' }}>
          Este contenido solo es accesible cuando hay conexión al servicio.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Muestra un mensaje informativo cuando no hay conexión en lugar de redirigir.',
      },
    },
  },
};

// Historia simulando contenido conectado
export const ConnectedContent: Story = {
  render: () => (
    <div
      style={{
        padding: '2rem',
        background: 'var(--background-color)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}
      >
        <h1 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
          🎯 Planning Votes Room
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Bienvenido a la sala de estimación. Este contenido solo es visible
          cuando hay conexión activa.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            style={{
              background: 'var(--primary-button-bg)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Votar Estimación
          </button>
          <button
            style={{
              background: 'var(--secondary-button-bg)',
              color: 'var(--secondary-button-text)',
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--secondary-button-border)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Revelar Cartas
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'var(--card-bg)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>
          Estado de Conexión: ✅ Conectado
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Todas las funcionalidades están disponibles.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Ejemplo de cómo se ve el contenido cuando el usuario está conectado al servicio.',
      },
    },
  },
};

// Simulación del mensaje de desconexión
export const DisconnectedMessage: Story = {
  render: () => (
    <div className="protected-route-message">
      <div className="protected-route-message__content">
        <div className="protected-route-message__icon">🔌</div>
        <h2 className="protected-route-message__title">
          Servicio no disponible
        </h2>
        <p className="protected-route-message__description">
          Se requiere conexión al servicio para acceder a esta funcionalidad.
          Por favor espera mientras intentamos reconectar.
        </p>
        <p className="protected-route-message__retry">
          Reintentando conexión...
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Simulación visual del mensaje que se muestra cuando no hay conexión al servicio.',
      },
    },
  },
};
