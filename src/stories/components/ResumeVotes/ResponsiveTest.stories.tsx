import { configureStore } from '@reduxjs/toolkit';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import ResumeVotes from '../../../components/ResumeVotes/ResumeVotes';
import '../../../i18n/i18n';

// Mock store para Redux
const createMockStore = (roomData: any) => {
  return configureStore({
    reducer: {
      room: (state = roomData) => state,
    },
  });
};

// Datos optimizados para probar responsive
const responsiveTestData = {
  roomId: 'room-responsive-test',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: [
    { userId: 'user-1', username: 'Ana', active: true },
    { userId: 'user-2', username: 'Bruno', active: true },
    { userId: 'user-3', username: 'Carlos', active: true },
    { userId: 'user-4', username: 'Diana', active: true },
    { userId: 'user-5', username: 'Eduardo', active: true },
    { userId: 'user-6', username: 'Fernanda', active: true },
    { userId: 'user-7', username: 'Gonzalo', active: true },
    { userId: 'user-8', username: 'Helena', active: true },
  ],
  tasks: [
    {
      id: 'task-1',
      description: 'Implementar autenticación JWT',
      voting: {
        status: 'completed',
        votes: {
          'user-1': 5,
          'user-2': 8,
          'user-3': 5,
          'user-4': 8,
          'user-5': 5,
          'user-6': 13,
          'user-7': 8,
          'user-8': 5,
        },
      },
    },
    {
      id: 'task-2',
      description: 'Crear dashboard interactivo',
      voting: {
        status: 'completed',
        votes: {
          'user-1': 13,
          'user-2': 21,
          'user-3': 13,
          'user-4': 8,
          'user-5': 13,
          'user-6': 21,
          'user-7': 13,
          'user-8': 8,
        },
      },
    },
    {
      id: 'task-3',
      description: 'Optimizar base de datos',
      voting: {
        status: 'completed',
        votes: {
          'user-1': 3,
          'user-2': 5,
          'user-3': 3,
          'user-4': 5,
          'user-5': 3,
          'user-6': 5,
          'user-7': 3,
          'user-8': 8,
        },
      },
    },
    {
      id: 'task-4',
      description: 'Configurar CI/CD pipeline',
      voting: {
        status: 'completed',
        votes: {
          'user-1': 8,
          'user-2': 13,
          'user-3': 8,
          'user-4': 13,
          'user-5': 8,
          'user-6': 13,
          'user-7': 8,
          'user-8': 13,
        },
      },
    },
  ],
};

const meta: Meta<typeof ResumeVotes> = {
  title: 'Components/ResumeVotes/ResponsiveTest',
  component: ResumeVotes,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pruebas específicas para el comportamiento responsive del componente ResumeVotes en diferentes tamaños de pantalla.',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const roomData = (context.args as any)?.roomData || responsiveTestData;
      const mockStore = createMockStore(roomData);

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[`/resume-votes/${roomData.roomId}`]}>
            <div
              style={{
                minHeight: '100vh',
                background: 'var(--bg-color, #f5f5f5)',
                padding: '0',
                margin: '0',
              }}
            >
              <Story />
            </div>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
  argTypes: {
    roomData: {
      control: false,
      description: 'Datos mock de la sala para la historia',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopView: Story = {
  name: 'Desktop (1200px+)',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story:
          'Vista completa de escritorio con todas las funcionalidades visibles: toggles con texto e iconos, estadísticas expandidas, y layout completo.',
      },
    },
  },
};

export const LaptopView: Story = {
  name: 'Laptop (1024px)',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'laptop',
    },
    docs: {
      description: {
        story:
          'Vista de laptop con layout ligeramente más compacto pero manteniendo todas las funcionalidades.',
      },
    },
  },
};

export const TabletLandscape: Story = {
  name: 'Tablet Horizontal (900px)',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tabletLandscape',
    },
    docs: {
      description: {
        story:
          'Vista de tablet en horizontal. Los toggles muestran solo iconos sin texto para ahorrar espacio.',
      },
    },
  },
};

export const TabletPortrait: Story = {
  name: 'Tablet Vertical (768px)',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'Vista de tablet en vertical. Punto crítico donde los toggles empiezan a mostrar solo iconos.',
      },
    },
  },
};

export const MobileLarge: Story = {
  name: 'Mobile Grande (414px)',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobileLarge',
    },
    docs: {
      description: {
        story:
          'Vista de móvil grande. Los toggles están completamente ocultos y se fuerza la vista de grid.',
      },
    },
  },
};

export const MobileStandard: Story = {
  name: 'Mobile Estándar (375px)',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Vista de móvil estándar. Layout completamente optimizado para pantallas pequeñas.',
      },
    },
  },
};

export const MobileSmall: Story = {
  name: 'Mobile Pequeño (320px)',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
    docs: {
      description: {
        story:
          'Vista de móvil pequeño. Prueba los límites del diseño responsive.',
      },
    },
  },
};

// Historia especial para probar el comportamiento en transiciones
export const ResponsiveTransition: Story = {
  name: 'Transición Responsive',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Historia base para probar transiciones responsive. Usa los controles de viewport de Storybook para ver cómo cambia el layout al redimensionar.',
      },
    },
  },
};

// Historia con contenido extra para probar límites
export const ResponsiveStressTest: Story = {
  name: 'Prueba de Estrés Responsive',
  args: {
    roomData: {
      ...responsiveTestData,
      users: Array.from({ length: 12 }, (_, i) => ({
        userId: `user-${i + 1}`,
        username: `Usuario ${i + 1}`,
        active: true,
      })),
      tasks: [
        {
          id: 'task-1',
          description: 'Tarea con muchos votos para probar responsive',
          voting: {
            status: 'completed',
            votes: Object.fromEntries(
              Array.from({ length: 12 }, (_, i) => [
                `user-${i + 1}`,
                [1, 2, 3, 5, 8, 13, 21][Math.floor(Math.random() * 7)],
              ])
            ),
          },
        },
        {
          id: 'task-2',
          description:
            'Segunda tarea con descripción más larga para probar el layout responsive cuando hay mucho contenido',
          voting: {
            status: 'completed',
            votes: Object.fromEntries(
              Array.from({ length: 12 }, (_, i) => [
                `user-${i + 1}`,
                [1, 2, 3, 5, 8, 13, 21][Math.floor(Math.random() * 7)],
              ])
            ),
          },
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Prueba el comportamiento responsive con más contenido: 12 usuarios y descripciones más largas. Ideal para encontrar puntos de quiebre en el diseño.',
      },
    },
  },
};

// Historia para probar orientación
export const OrientationTest: Story = {
  name: 'Prueba de Orientación',
  args: {
    roomData: responsiveTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Prueba específica para cambios de orientación en móviles. Simula el comportamiento cuando el dispositivo se rota.',
      },
    },
  },
};
