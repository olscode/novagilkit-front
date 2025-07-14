import { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import {
  ToastProvider,
  useToast,
  useToastNotification,
} from '../../../components/Toast/ToastContext';

// Componente de demostración para mostrar varias notificaciones
const ToastDemo = () => {
  const { addToast } = useToast();
  const { showSuccess, showInfo, showWarning, showError } =
    useToastNotification();
  const [demoStarted, setDemoStarted] = useState(false);

  // Usando método addToast directamente
  const showSuccessToast = () => {
    addToast({
      message: '¡La operación se realizó con éxito!',
      type: 'success',
      duration: 5000,
    });
  };

  // Usando helpers del hook useToastNotification
  const showInfoToast = () => {
    showInfo('Un nuevo usuario se ha unido a la sala', {
      duration: 4000,
      icon: '👋',
    });
  };

  const showWarningToast = () => {
    showWarning('La conexión es inestable, puede haber retrasos', {
      duration: 6000,
    });
  };

  const showErrorToast = () => {
    showError('No se pudo conectar con el servidor', {
      duration: 7000,
    });
  };

  // Demo para mostrar todos los tipos de toast en secuencia
  const demoAllNotifications = () => {
    setDemoStarted(true);
    showInfoToast();

    setTimeout(() => {
      showSuccessToast();
    }, 1500);

    setTimeout(() => {
      showWarningToast();
    }, 3000);

    setTimeout(() => {
      showErrorToast();
    }, 4500);

    // Resetear el estado después de la demo
    setTimeout(() => {
      setDemoStarted(false);
    }, 12000);
  };

  // Ejemplos contextuales de uso en la aplicación de Poker Planning
  const simulateUserJoin = () => {
    showInfo('Juan se ha unido a la sala', { icon: '👋' });
  };

  const simulateRoomCreated = () => {
    showSuccess('Sala creada con éxito', {
      icon: '🎲',
      duration: 5000,
    });
  };

  const simulateVotingComplete = () => {
    addToast({
      type: 'success',
      message: 'Votación completada: Resultado final 5 puntos',
      icon: '🏆',
      duration: 6000,
    });
  };

  const simulateDisconnection = () => {
    showWarning('Carlos se ha desconectado', {
      icon: '⚠️',
      duration: 8000,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
        maxWidth: '500px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ margin: '0 0 5px 0' }}>Sistema de Notificaciones Toast</h2>
      <p style={{ margin: '0 0 20px 0', opacity: 0.7 }}>
        Una demostración interactiva del sistema de notificaciones para la
        aplicación Poker Planning
      </p>

      <div
        style={{
          border: '1px solid #e1e1e1',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Tipos básicos</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <button
            onClick={showSuccessToast}
            style={{
              padding: '10px 15px',
              backgroundColor: '#198754',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Éxito
          </button>
          <button
            onClick={showInfoToast}
            style={{
              padding: '10px 15px',
              backgroundColor: '#0dcaf0',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Información
          </button>
          <button
            onClick={showWarningToast}
            style={{
              padding: '10px 15px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Advertencia
          </button>
          <button
            onClick={showErrorToast}
            style={{
              padding: '10px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Error
          </button>
        </div>
      </div>

      <div
        style={{
          border: '1px solid #e1e1e1',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Ejemplos de Poker Planning</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <button
            onClick={simulateUserJoin}
            style={{
              padding: '10px 15px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Usuario se une
          </button>
          <button
            onClick={simulateRoomCreated}
            style={{
              padding: '10px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Sala creada
          </button>
          <button
            onClick={simulateVotingComplete}
            style={{
              padding: '10px 15px',
              backgroundColor: '#20c997',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Votación completada
          </button>
          <button
            onClick={simulateDisconnection}
            style={{
              padding: '10px 15px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Usuario desconectado
          </button>
        </div>
      </div>

      <button
        onClick={demoAllNotifications}
        disabled={demoStarted}
        style={{
          padding: '15px',
          backgroundColor: demoStarted ? '#6c757d' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginTop: '10px',
          cursor: demoStarted ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s',
        }}
      >
        {demoStarted
          ? 'Demostración en progreso...'
          : 'Demostrar todos los tipos secuencialmente'}
      </button>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          border: '1px dashed #ccc',
          borderRadius: '5px',
          backgroundColor: 'rgba(0,0,0,0.03)',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0' }}>
          Sobre el sistema de notificaciones
        </h4>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>
          Este sistema utiliza un contexto React para gestionar las
          notificaciones en toda la aplicación. Hay dos formas principales de
          crear notificaciones:
        </p>
        <ul style={{ fontSize: '0.9rem', margin: '0', paddingLeft: '20px' }}>
          <li>
            <code>addToast()</code> - Método directo del contexto
          </li>
          <li>
            <code>showSuccess(), showInfo(), etc.</code> - Helpers del hook
            personalizado
          </li>
        </ul>
      </div>
    </div>
  );
};

// Envolvemos el componente de demostración con el ToastProvider
const ToastDemoWithProvider = () => (
  <ToastProvider>
    <ToastDemo />
  </ToastProvider>
);

// Componente para mostrar el uso programático desde código
const ProgrammaticDemo = () => {
  const { showSuccess, showInfo, showWarning } = useToastNotification();

  // Simulamos notificaciones automáticas al cargar el componente
  useEffect(() => {
    // Mostrar una notificación inicial
    showInfo('Bienvenido a la demostración del sistema de notificaciones', {
      duration: 3000,
    });

    // Después de 4 segundos, mostrar otra notificación
    const timer1 = setTimeout(() => {
      showSuccess('Sistema inicializado correctamente', {
        duration: 3000,
      });
    }, 4000);

    // Después de 8 segundos, mostrar una advertencia
    const timer2 = setTimeout(() => {
      showWarning('Esta es una demostración automática', {
        duration: 3000,
      });
    }, 8000);

    // Limpiar temporizadores
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <h2>Demostración Programática</h2>
      <p>Las notificaciones aparecerán automáticamente...</p>
      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
        Este ejemplo muestra cómo las notificaciones pueden ser programadas para
        aparecer automáticamente en respuesta a eventos del sistema.
      </p>
    </div>
  );
};

// Componente para la demostración programática envuelto con el provider
const ProgrammaticDemoWithProvider = () => (
  <ToastProvider>
    <ProgrammaticDemo />
  </ToastProvider>
);

// Configuración de la historia
const meta = {
  title: 'Components/Toast/ToastSystem',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Un sistema de notificaciones toast completo para mostrar mensajes de información, éxito, advertencia y error en la aplicación Poker Planning.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal con la demostración interactiva
export const Interactive: Story = {
  render: () => <ToastDemoWithProvider />,
  parameters: {
    docs: {
      description: {
        story:
          'Demostración interactiva que permite probar los diferentes tipos de notificaciones toast.',
      },
    },
  },
};

// Historia que muestra las notificaciones apareciendo programáticamente
export const Programmatic: Story = {
  render: () => <ProgrammaticDemoWithProvider />,
  parameters: {
    docs: {
      description: {
        story:
          'Demostración de cómo las notificaciones pueden aparecer automáticamente en respuesta a eventos del sistema.',
      },
    },
  },
};
