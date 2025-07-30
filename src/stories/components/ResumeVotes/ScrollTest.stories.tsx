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

// Datos específicos para probar scroll y overflow
const scrollTestData = {
  roomId: 'room-scroll-test',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: [
    { userId: 'user-1', username: 'Ana García', active: true },
    { userId: 'user-2', username: 'Bruno Silva', active: true },
    { userId: 'user-3', username: 'Carlos Mendoza', active: true },
    { userId: 'user-4', username: 'Diana López', active: true },
    { userId: 'user-5', username: 'Eduardo Ruiz', active: true },
    { userId: 'user-6', username: 'Fernanda Torres', active: true },
    { userId: 'user-7', username: 'Gonzalo Herrera', active: true },
    { userId: 'user-8', username: 'Helena Morales', active: true },
    { userId: 'user-9', username: 'Iván Castillo', active: true },
    { userId: 'user-10', username: 'Juliana Reyes', active: true },
    { userId: 'user-11', username: 'Kevin Martínez', active: true },
    { userId: 'user-12', username: 'Lucía Fernández', active: true },
    { userId: 'user-13', username: 'Miguel Vargas', active: true },
    { userId: 'user-14', username: 'Natalia Jiménez', active: true },
    { userId: 'user-15', username: 'Óscar Ramírez', active: true },
  ],
  tasks: [
    {
      id: 'task-1',
      description: 'Implementar autenticación con JWT y refresh tokens',
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
          'user-9': 8,
          'user-10': 5,
          'user-11': 8,
          'user-12': 5,
          'user-13': 13,
          'user-14': 8,
          'user-15': 5,
        },
      },
    },
    {
      id: 'task-2',
      description: 'Crear dashboard con gráficos interactivos',
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
          'user-9': 21,
          'user-10': 13,
          'user-11': 8,
          'user-12': 13,
          'user-13': 21,
          'user-14': 13,
          'user-15': 8,
        },
      },
    },
    {
      id: 'task-3',
      description: 'Optimizar queries de base de datos',
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
          'user-9': 5,
          'user-10': 3,
          'user-11': 5,
          'user-12': 3,
          'user-13': 5,
          'user-14': 3,
          'user-15': 8,
        },
      },
    },
    {
      id: 'task-4',
      description: 'Configurar pipeline de CI/CD completo',
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
          'user-9': 8,
          'user-10': 13,
          'user-11': 8,
          'user-12': 13,
          'user-13': 8,
          'user-14': 13,
          'user-15': 8,
        },
      },
    },
    {
      id: 'task-5',
      description: 'Implementar sistema de notificaciones push',
      voting: {
        status: 'completed',
        votes: {
          'user-1': 21,
          'user-2': 13,
          'user-3': 21,
          'user-4': 13,
          'user-5': 21,
          'user-6': 13,
          'user-7': 21,
          'user-8': 13,
          'user-9': 21,
          'user-10': 13,
          'user-11': 21,
          'user-12': 13,
          'user-13': 21,
          'user-14': 13,
          'user-15': 21,
        },
      },
    },
  ],
};

const meta: Meta<typeof ResumeVotes> = {
  title: 'Components/ResumeVotes/ScrollTest',
  component: ResumeVotes,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pruebas específicas para el comportamiento del scroll y overflow en el componente ResumeVotes.',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const roomData = (context.args as any)?.roomData || scrollTestData;
      const mockStore = createMockStore(roomData);

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[`/resume-votes/${roomData.roomId}`]}>
            <div
              style={{
                minHeight: '100vh',
                background: 'var(--bg-color, #f5f5f5)',
                // Contenedor con altura fija para forzar scroll
                ...((context.args as any)?.containerStyles || {}),
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
    containerStyles: {
      control: false,
      description: 'Estilos del contenedor para probar scroll',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollHorizontalVotes: Story = {
  name: 'Scroll Horizontal - Votos por Usuario',
  args: {
    roomData: scrollTestData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Prueba el comportamiento del scroll horizontal en la sección de votos por usuario cuando hay muchos votantes. Fíjate en cómo se manejan los 15 usuarios en cada tarea.',
      },
    },
  },
};

export const ScrollVerticalTasks: Story = {
  name: 'Scroll Vertical - Muchas Tareas',
  args: {
    roomData: {
      ...scrollTestData,
      tasks: Array.from({ length: 12 }, (_, i) => ({
        id: `task-${i + 1}`,
        description: `Tarea ${i + 1}: ${
          [
            'Implementar autenticación con JWT y refresh tokens',
            'Crear dashboard con gráficos interactivos',
            'Optimizar queries de base de datos',
            'Configurar pipeline de CI/CD completo',
            'Implementar sistema de notificaciones push',
            'Crear API REST para gestión de usuarios',
            'Configurar monitoreo con Prometheus',
            'Implementar cache Redis para sesiones',
            'Crear tests unitarios y de integración',
            'Optimizar rendimiento del frontend',
            'Implementar búsqueda avanzada',
            'Configurar backup automático de BD',
          ][i] || `Descripción de la tarea ${i + 1}`
        }`,
        voting: {
          status: 'completed',
          votes: Object.fromEntries(
            scrollTestData.users.map((user) => [
              user.userId,
              [1, 2, 3, 5, 8, 13, 21][Math.floor(Math.random() * 7)],
            ])
          ),
        },
      })),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Prueba el comportamiento del scroll vertical cuando hay muchas tareas. Verifica que el scroll funciona correctamente y que el rendimiento se mantiene.',
      },
    },
  },
};

export const ScrollContenedorPequeño: Story = {
  name: 'Contenedor Pequeño - Scroll Forzado',
  args: {
    roomData: scrollTestData,
    containerStyles: {
      height: '600px',
      overflow: 'auto',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      margin: '20px',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Prueba el comportamiento cuando el componente está dentro de un contenedor con altura fija. Esto simula el uso en un modal o sección limitada.',
      },
    },
  },
};

export const ScrollListaVsGrid: Story = {
  name: 'Comparación Lista vs Grid - Scroll',
  args: {
    roomData: scrollTestData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Permite comparar el comportamiento del scroll entre vista de lista y vista de grid. Usa los toggles para cambiar entre vistas y observa las diferencias.',
      },
    },
  },
};

export const ScrollMobileComparison: Story = {
  name: 'Scroll en Mobile vs Desktop',
  args: {
    roomData: scrollTestData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Prueba el comportamiento del scroll en dispositivos móviles. Compara con la vista desktop para verificar la optimización responsive.',
      },
    },
  },
};

export const OverflowTestVotesSection: Story = {
  name: 'Overflow Test - Sección de Votos',
  args: {
    roomData: {
      ...scrollTestData,
      // Agregar más usuarios para forzar overflow
      users: Array.from({ length: 30 }, (_, i) => ({
        userId: `user-${i + 1}`,
        username: `Usuario ${i + 1} Con Nombre Largo`,
        active: true,
      })),
      tasks: [
        {
          id: 'task-1',
          description: 'Tarea con muchos votos para probar overflow',
          voting: {
            status: 'completed',
            votes: Object.fromEntries(
              Array.from({ length: 30 }, (_, i) => [
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
          'Prueba específicamente el overflow en la sección de votos con 30 usuarios. Verifica que el scroll horizontal funciona correctamente y que no se rompe el layout.',
      },
    },
  },
};
