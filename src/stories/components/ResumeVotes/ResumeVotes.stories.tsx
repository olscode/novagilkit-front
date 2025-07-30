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

// Datos mock para diferentes escenarios
const generateMockUsers = (count: number) => {
  const names = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Brown',
    'Diana Prince',
    'Ethan Hunt',
    'Fiona Green',
    'George Wilson',
    'Hannah Davis',
    'Ian Roberts',
    'Julia White',
    'Kevin Lee',
    'Laura Martinez',
    'Michael Chen',
    'Nina Taylor',
    'Oscar Garcia',
    'Paula Anderson',
    'Quinn Thompson',
    'Rachel Moore',
    'Steve Clark',
    'Tina Lewis',
    'Ulrich Wagner',
    'Vera Santos',
    'Will Turner',
    'Xara Kim',
    'Yuki Tanaka',
    'Zoe Parker',
    'Alex Rivera',
    'Beth Cooper',
    'Chris Evans',
    'Debbie Reynolds',
  ];

  return Array.from({ length: count }, (_, i) => ({
    userId: `user-${i + 1}`,
    username:
      names[i % names.length] +
      (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
    active: true,
  }));
};

const generateMockVotes = (
  users: any[],
  fibonacciValues = [1, 2, 3, 5, 8, 13, 21]
) => {
  const votes: Record<string, number> = {};
  users.forEach((user) => {
    // Algunos usuarios no votan para simular realismo
    if (Math.random() > 0.1) {
      // 90% de participación
      votes[user.userId] =
        fibonacciValues[Math.floor(Math.random() * fibonacciValues.length)];
    }
  });
  return votes;
};

const generateMockTasks = (taskCount: number, users: any[]) => {
  const taskDescriptions = [
    'Implementar sistema de autenticación con JWT',
    'Crear componente de dashboard principal',
    'Configurar pipeline de CI/CD',
    'Implementar sistema de notificaciones push',
    'Optimizar consultas de base de datos',
    'Crear tests unitarios para módulo de usuarios',
    'Implementar cache Redis para sesiones',
    'Diseñar API REST para gestión de productos',
    'Configurar monitoreo con Prometheus',
    'Implementar búsqueda avanzada con Elasticsearch',
    'Crear documentación técnica de la API',
    'Optimizar rendimiento del frontend',
    'Implementar sistema de roles y permisos',
    'Configurar backup automático de base de datos',
    'Crear sistema de logs centralizado',
    'Implementar integración con servicios externos',
    'Optimizar imágenes y assets estáticos',
    'Crear sistema de auditoría de cambios',
    'Implementar chat en tiempo real',
    'Configurar entorno de staging',
  ];

  return Array.from({ length: taskCount }, (_, i) => ({
    id: `task-${i + 1}`,
    description:
      taskDescriptions[i % taskDescriptions.length] +
      (i >= taskDescriptions.length
        ? ` (Iteración ${Math.floor(i / taskDescriptions.length) + 1})`
        : ''),
    voting: {
      status: 'completed',
      votes: generateMockVotes(users),
    },
  }));
};

// Escenario básico con pocos usuarios
const basicRoomData = {
  roomId: 'room-123',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: generateMockUsers(5),
  tasks: generateMockTasks(6, generateMockUsers(5)),
};

// Escenario con muchos usuarios
const manyUsersRoomData = {
  roomId: 'room-456',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: generateMockUsers(25),
  tasks: generateMockTasks(8, generateMockUsers(25)),
};

// Escenario con muchas tareas
const manyTasksRoomData = {
  roomId: 'room-789',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: generateMockUsers(8),
  tasks: generateMockTasks(20, generateMockUsers(8)),
};

// Escenario con consenso alto
const highConsensusUsers = generateMockUsers(6);
const highConsensusRoomData = {
  roomId: 'room-consensus',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: highConsensusUsers,
  tasks: [
    {
      id: 'task-1',
      description: 'Tarea con consenso muy alto - todos votan 5',
      voting: {
        status: 'completed',
        votes: Object.fromEntries(highConsensusUsers.map((u) => [u.userId, 5])),
      },
    },
    {
      id: 'task-2',
      description: 'Tarea con consenso medio - votos entre 3 y 8',
      voting: {
        status: 'completed',
        votes: Object.fromEntries(
          highConsensusUsers.map((u) => [
            u.userId,
            [3, 5, 5, 8, 5, 8][Math.floor(Math.random() * 6)],
          ])
        ),
      },
    },
    {
      id: 'task-3',
      description: 'Tarea con consenso bajo - votos muy dispersos',
      voting: {
        status: 'completed',
        votes: Object.fromEntries(
          highConsensusUsers.map((u) => [
            u.userId,
            [1, 3, 8, 13, 21, 2][Math.floor(Math.random() * 6)],
          ])
        ),
      },
    },
  ],
};

// Escenario vacío
const emptyRoomData = {
  roomId: 'room-empty',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: [],
  tasks: [],
};

// Escenario con tareas sin votos
const noVotesRoomData = {
  roomId: 'room-no-votes',
  creatorId: 'user-1',
  app: 'planning-votes',
  users: generateMockUsers(4),
  tasks: [
    {
      id: 'task-1',
      description: 'Tarea sin votos aún',
      voting: {
        status: 'pending',
        votes: {},
      },
    },
    {
      id: 'task-2',
      description: 'Otra tarea pendiente',
      voting: {
        status: 'pending',
        votes: {},
      },
    },
  ],
};

const meta: Meta<typeof ResumeVotes> = {
  title: 'Components/ResumeVotes',
  component: ResumeVotes,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Componente para mostrar el resumen de votaciones de Planning Votes con estadísticas generales, vistas de grid/lista y funcionalidad de exportar a Jira.',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const roomData = (context.args as any)?.roomData || basicRoomData;
      const mockStore = createMockStore(roomData);

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[`/resume-votes/${roomData.roomId}`]}>
            <div
              style={{
                minHeight: '100vh',
                background: 'var(--bg-color, #f5f5f5)',
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

// Historias principales
export const Default: Story = {
  name: 'Vista por Defecto',
  args: {
    roomData: basicRoomData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vista básica con pocos usuarios y tareas. Muestra el comportamiento normal del componente.',
      },
    },
  },
};

export const ManyUsers: Story = {
  name: 'Muchos Usuarios',
  args: {
    roomData: manyUsersRoomData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Escenario con 25 usuarios para probar el comportamiento del scroll y layout con muchos votos por tarea.',
      },
    },
  },
};

export const ManyTasks: Story = {
  name: 'Muchas Tareas',
  args: {
    roomData: manyTasksRoomData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Escenario con 20 tareas para probar el scroll vertical y el rendimiento con mucho contenido.',
      },
    },
  },
};

export const ConsensusVariations: Story = {
  name: 'Variaciones de Consenso',
  args: {
    roomData: highConsensusRoomData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Muestra tareas con diferentes niveles de consenso (alto, medio, bajo) para probar los indicadores visuales.',
      },
    },
  },
};

export const EmptyState: Story = {
  name: 'Estado Vacío',
  args: {
    roomData: emptyRoomData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Estado cuando no hay datos disponibles. Muestra el mensaje de estado vacío con sugerencias.',
      },
    },
  },
};

export const NoVotes: Story = {
  name: 'Sin Votos',
  args: {
    roomData: noVotesRoomData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Escenario con tareas creadas pero sin votos aún. Muestra el estado vacío cuando no hay votaciones completadas.',
      },
    },
  },
};

// Historias para probar responsive
export const MobileView: Story = {
  name: 'Vista Mobile',
  args: {
    roomData: basicRoomData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Vista optimizada para dispositivos móviles. Los toggles se ocultan y se fuerza la vista de grid.',
      },
    },
  },
};

export const TabletView: Story = {
  name: 'Vista Tablet',
  args: {
    roomData: manyUsersRoomData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'Vista para tablets. Los toggles muestran solo iconos, sin texto.',
      },
    },
  },
};

// Historia para probar con datos extremos
export const ExtremeCaseUsers: Story = {
  name: 'Caso Extremo - 50 Usuarios',
  args: {
    roomData: {
      roomId: 'room-extreme',
      creatorId: 'user-1',
      app: 'planning-votes',
      users: generateMockUsers(50),
      tasks: generateMockTasks(5, generateMockUsers(50)),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Caso extremo con 50 usuarios para probar el rendimiento y scroll en la sección de votos por usuario.',
      },
    },
  },
};

export const ExtremeCaseTasks: Story = {
  name: 'Caso Extremo - 50 Tareas',
  args: {
    roomData: {
      roomId: 'room-extreme-tasks',
      creatorId: 'user-1',
      app: 'planning-votes',
      users: generateMockUsers(6),
      tasks: generateMockTasks(50, generateMockUsers(6)),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Caso extremo con 50 tareas para probar el scroll vertical y rendimiento con mucho contenido.',
      },
    },
  },
};

// Historia para probar nombres largos
export const LongUsernames: Story = {
  name: 'Nombres de Usuario Largos',
  args: {
    roomData: {
      roomId: 'room-long-names',
      creatorId: 'user-1',
      app: 'planning-votes',
      users: [
        {
          userId: 'user-1',
          username: 'María Fernanda González Rodríguez',
          active: true,
        },
        {
          userId: 'user-2',
          username: 'Alessandro Di Marco Benedetti',
          active: true,
        },
        {
          userId: 'user-3',
          username: 'Jean-Baptiste Pierre-Henri Dubois',
          active: true,
        },
        {
          userId: 'user-4',
          username: 'Anastasia Nikolaevna Volkonsky',
          active: true,
        },
        {
          userId: 'user-5',
          username: 'Muhammad Abdullah Al-Rashid',
          active: true,
        },
        {
          userId: 'user-6',
          username: 'Χριστόφορος Παπαδόπουλος',
          active: true,
        },
      ],
      tasks: generateMockTasks(4, [
        {
          userId: 'user-1',
          username: 'María Fernanda González Rodríguez',
          active: true,
        },
        {
          userId: 'user-2',
          username: 'Alessandro Di Marco Benedetti',
          active: true,
        },
        {
          userId: 'user-3',
          username: 'Jean-Baptiste Pierre-Henri Dubois',
          active: true,
        },
        {
          userId: 'user-4',
          username: 'Anastasia Nikolaevna Volkonsky',
          active: true,
        },
        {
          userId: 'user-5',
          username: 'Muhammad Abdullah Al-Rashid',
          active: true,
        },
        {
          userId: 'user-6',
          username: 'Χριστόφορος Παπαδόπουλος',
          active: true,
        },
      ]),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Prueba con nombres de usuario muy largos para verificar el truncamiento y responsive design.',
      },
    },
  },
};

// Historia con descripciones de tareas largas
export const LongTaskDescriptions: Story = {
  name: 'Descripciones Largas de Tareas',
  args: {
    roomData: {
      roomId: 'room-long-descriptions',
      creatorId: 'user-1',
      app: 'planning-votes',
      users: generateMockUsers(4),
      tasks: [
        {
          id: 'task-1',
          description:
            'Implementar un sistema complejo de autenticación y autorización que incluya múltiples proveedores OAuth2, JWT tokens con refresh, rate limiting, y un sistema avanzado de roles y permisos granulares que permita gestionar accesos a diferentes módulos de la aplicación con diferentes niveles de privilegios.',
          voting: {
            status: 'completed',
            votes: generateMockVotes(generateMockUsers(4)),
          },
        },
        {
          id: 'task-2',
          description:
            'Crear una arquitectura de microservicios escalable que incluya service discovery, circuit breakers, distributed tracing, centralized logging, health checks, y un API gateway que pueda manejar load balancing, request routing, y authentication de manera eficiente.',
          voting: {
            status: 'completed',
            votes: generateMockVotes(generateMockUsers(4)),
          },
        },
        {
          id: 'task-3',
          description:
            'Optimizar el rendimiento de la base de datos implementando índices compuestos, particionamiento horizontal, connection pooling, query optimization, caching strategies con Redis, y un sistema de replicación maestro-esclavo para distribuir la carga de lectura.',
          voting: {
            status: 'completed',
            votes: generateMockVotes(generateMockUsers(4)),
          },
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Prueba con descripciones de tareas muy largas para verificar el layout y responsive design.',
      },
    },
  },
};
