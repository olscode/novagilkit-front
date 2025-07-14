// Configuración adicional para las historias de ResumeVotes
export const viewports = {
  mobile320: {
    name: 'Mobile 320px',
    styles: {
      width: '320px',
      height: '568px',
    },
  },
  mobile375: {
    name: 'Mobile 375px',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  mobile414: {
    name: 'Mobile 414px',
    styles: {
      width: '414px',
      height: '896px',
    },
  },
  tablet768: {
    name: 'Tablet 768px',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  tablet900: {
    name: 'Tablet 900px',
    styles: {
      width: '900px',
      height: '1200px',
    },
  },
  laptop1024: {
    name: 'Laptop 1024px',
    styles: {
      width: '1024px',
      height: '768px',
    },
  },
  desktop1200: {
    name: 'Desktop 1200px',
    styles: {
      width: '1200px',
      height: '900px',
    },
  },
  ultrawide: {
    name: 'Ultrawide 1920px',
    styles: {
      width: '1920px',
      height: '1080px',
    },
  },
};

// CSS personalizado para las historias
export const customCSS = `
  /* Estilos para resaltar el comportamiento del scroll */
  .storybook-scroll-test .tasks-container {
    border: 2px dashed rgba(255, 0, 0, 0.2);
    position: relative;
  }
  
  .storybook-scroll-test .tasks-container::before {
    content: "Área de scroll";
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 12px;
    color: rgba(255, 0, 0, 0.6);
    font-weight: bold;
  }
  
  .storybook-scroll-test .task-votes .votes-list {
    border: 1px dashed rgba(0, 0, 255, 0.2);
    position: relative;
  }
  
  .storybook-scroll-test .task-votes .votes-list::before {
    content: "Scroll horizontal";
    position: absolute;
    top: -15px;
    right: 0;
    font-size: 10px;
    color: rgba(0, 0, 255, 0.6);
  }
  
  /* Resaltar puntos de quiebre responsive */
  @media (max-width: 768px) {
    .storybook-responsive-test::before {
      content: "Mobile: toggles ocultos, grid forzado";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 193, 7, 0.9);
      color: black;
      text-align: center;
      padding: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
    }
  }
  
  @media (min-width: 769px) and (max-width: 900px) {
    .storybook-responsive-test::before {
      content: "Tablet: toggles solo iconos";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(0, 123, 255, 0.9);
      color: white;
      text-align: center;
      padding: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
    }
  }
  
  @media (min-width: 901px) {
    .storybook-responsive-test::before {
      content: "Desktop: funcionalidad completa";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(40, 167, 69, 0.9);
      color: white;
      text-align: center;
      padding: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
    }
  }
`;

// Herramientas para generar datos de prueba
export const generateTestData = {
  // Generar usuarios con nombres realistas
  users: (count: number, useLongNames: boolean = false) => {
    const shortNames = [
      'Ana',
      'Bruno',
      'Carlos',
      'Diana',
      'Eduardo',
      'Fiona',
      'Gonzalo',
      'Helena',
    ];
    const longNamesList = [
      'María Fernanda González Rodríguez',
      'Alessandro Di Marco Benedetti',
      'Jean-Baptiste Pierre-Henri Dubois',
      'Anastasia Nikolaevna Volkonsky',
    ];

    const nameList = useLongNames ? longNamesList : shortNames;

    return Array.from({ length: count }, (_, i) => ({
      userId: `user-${i + 1}`,
      username:
        nameList[i % nameList.length] +
        (i >= nameList.length ? ` ${Math.floor(i / nameList.length) + 1}` : ''),
      active: true,
    }));
  },

  // Generar votos con diferentes patrones
  votes: {
    highConsensus: (users: any[]) => {
      const value = [1, 2, 3, 5, 8][Math.floor(Math.random() * 5)];
      return Object.fromEntries(users.map((u) => [u.userId, value]));
    },

    lowConsensus: (users: any[]) => {
      return Object.fromEntries(
        users.map((u) => [
          u.userId,
          [1, 2, 3, 5, 8, 13, 21][Math.floor(Math.random() * 7)],
        ])
      );
    },

    realistic: (users: any[]) => {
      // 90% de participación
      const participatingUsers = users.filter(() => Math.random() > 0.1);
      return Object.fromEntries(
        participatingUsers.map((u) => [
          u.userId,
          [1, 2, 3, 5, 8, 13][Math.floor(Math.random() * 6)],
        ])
      );
    },
  },

  // Generar tareas con descripciones realistas
  tasks: (
    count: number,
    users: any[],
    useLongDescriptions: boolean = false
  ) => {
    const shortDescriptions = [
      'Implementar autenticación JWT',
      'Crear dashboard interactivo',
      'Optimizar queries de BD',
      'Configurar CI/CD pipeline',
      'Implementar notificaciones push',
      'Crear API REST',
      'Configurar monitoreo',
      'Implementar cache Redis',
    ];

    const longDescriptionsList = [
      'Implementar un sistema complejo de autenticación y autorización que incluya múltiples proveedores OAuth2, JWT tokens con refresh, rate limiting, y un sistema avanzado de roles y permisos granulares',
      'Crear una arquitectura de microservicios escalable que incluya service discovery, circuit breakers, distributed tracing, centralized logging, health checks, y un API gateway',
      'Optimizar el rendimiento de la base de datos implementando índices compuestos, particionamiento horizontal, connection pooling, query optimization, caching strategies con Redis',
    ];

    const descriptions = useLongDescriptions
      ? longDescriptionsList
      : shortDescriptions;

    return Array.from({ length: count }, (_, i) => ({
      id: `task-${i + 1}`,
      description:
        descriptions[i % descriptions.length] +
        (i >= descriptions.length
          ? ` (Iteración ${Math.floor(i / descriptions.length) + 1})`
          : ''),
      voting: {
        status: 'completed',
        votes: generateTestData.votes.realistic(users),
      },
    }));
  },
};

// Configuraciones predefinidas para diferentes escenarios
export const scenarios = {
  basic: {
    users: 5,
    tasks: 6,
    userType: 'normal',
    taskType: 'normal',
  },

  manyUsers: {
    users: 25,
    tasks: 8,
    userType: 'normal',
    taskType: 'normal',
  },

  manyTasks: {
    users: 8,
    tasks: 20,
    userType: 'normal',
    taskType: 'normal',
  },

  longContent: {
    users: 6,
    tasks: 3,
    userType: 'long',
    taskType: 'long',
  },

  extreme: {
    users: 50,
    tasks: 50,
    userType: 'normal',
    taskType: 'normal',
  },
};

export default {
  viewports,
  customCSS,
  generateTestData,
  scenarios,
};
