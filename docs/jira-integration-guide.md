# Integración con Jira

## Resumen

Esta documentación describe cómo implementar la integración completa con Jira para exportar las tareas estimadas en Planning Votes directamente como issues en Jira bajo una Epic específica.

## Funcionalidades

### 1. Autenticación OAuth 2.0

- Login seguro con cuenta de Jira/Atlassian
- Gestión de tokens de acceso
- Renovación automática de tokens

### 2. Selección de Proyecto y Epic

- Lista de proyectos accesibles
- Filtrado de Epics por proyecto
- Preview de issues a crear

### 3. Mapeo de Datos

- Descripción de tarea → Summary del issue
- Estimación promedio → Story Points
- Estadísticas de consenso → Descripción detallada
- Metadatos de votación → Custom fields

## Configuración

### 1. Registro en Atlassian Developer Console

1. Ve a [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Crea una nueva app OAuth 2.0
3. Configura los scopes necesarios:
   - `read:jira-work` - Leer proyectos y issues
   - `write:jira-work` - Crear y modificar issues
   - `manage:jira-project` - Gestionar proyectos

### 2. Variables de Entorno

```env
REACT_APP_JIRA_CLIENT_ID=your_client_id
REACT_APP_JIRA_CLIENT_SECRET=your_client_secret
```

### 3. URLs de Callback

- Desarrollo: `http://localhost:5173/auth/jira/callback`
- Producción: `https://yourdomain.com/auth/jira/callback`

## Implementación

### 1. Servicio de Autenticación

```typescript
// services/JiraAuthService.ts
export class JiraAuthService {
  private static readonly AUTH_URL = 'https://auth.atlassian.com/authorize';
  private static readonly TOKEN_URL = 'https://auth.atlassian.com/oauth/token';

  async initiateLogin(): Promise<void> {
    const params = new URLSearchParams({
      audience: 'api.atlassian.com',
      client_id: process.env.REACT_APP_JIRA_CLIENT_ID!,
      scope: 'read:jira-work write:jira-work manage:jira-project',
      redirect_uri: this.getRedirectUri(),
      state: this.generateState(),
      response_type: 'code',
      prompt: 'consent',
    });

    window.location.href = `${JiraAuthService.AUTH_URL}?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<JiraTokens> {
    const response = await fetch(JiraAuthService.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_JIRA_CLIENT_ID,
        client_secret: process.env.REACT_APP_JIRA_CLIENT_SECRET,
        code,
        redirect_uri: this.getRedirectUri(),
      }),
    });

    return response.json();
  }
}
```

### 2. Servicio de API de Jira

```typescript
// services/JiraApiService.ts
export class JiraApiService {
  constructor(
    private accessToken: string,
    private cloudId: string
  ) {}

  private get baseUrl() {
    return `https://api.atlassian.com/ex/jira/${this.cloudId}/rest/api/3`;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async getAccessibleResources(): Promise<JiraResource[]> {
    const response = await fetch(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      { headers: this.headers }
    );
    return response.json();
  }

  async getProjects(): Promise<JiraProject[]> {
    const response = await fetch(`${this.baseUrl}/project`, {
      headers: this.headers,
    });
    return response.json();
  }

  async getEpics(projectKey: string): Promise<JiraIssue[]> {
    const jql = `project = "${projectKey}" AND issuetype = Epic ORDER BY created DESC`;
    const response = await fetch(
      `${this.baseUrl}/search?jql=${encodeURIComponent(jql)}&fields=key,summary,status`,
      { headers: this.headers }
    );
    const data = await response.json();
    return data.issues;
  }

  async createStory(
    projectKey: string,
    epicKey: string,
    task: TaskStats
  ): Promise<JiraIssue> {
    const issueData = {
      fields: {
        project: { key: projectKey },
        parent: { key: epicKey },
        summary: task.description,
        issuetype: { name: 'Story' },
        customfield_10016: Math.round(task.average), // Story Points
        description: this.createDescription(task),
      },
    };

    const response = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(issueData),
    });

    return response.json();
  }

  private createDescription(task: TaskStats) {
    return {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '📊 ', marks: [{ type: 'strong' }] },
            {
              type: 'text',
              text: 'Resultados del Planning Votes',
              marks: [{ type: 'strong' }],
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Estimación promedio: ',
                      marks: [{ type: 'strong' }],
                    },
                    { type: 'text', text: `${task.average.toFixed(1)} puntos` },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Consenso del equipo: ',
                      marks: [{ type: 'strong' }],
                    },
                    { type: 'text', text: `${task.consensus}%` },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Rango de estimaciones: ',
                      marks: [{ type: 'strong' }],
                    },
                    { type: 'text', text: `${task.min} - ${task.max} puntos` },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Participantes: ',
                      marks: [{ type: 'strong' }],
                    },
                    { type: 'text', text: `${task.count} votos` },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }
}
```

### 3. Componente de Exportación

```typescript
// components/JiraExport/JiraExportModal.tsx
interface JiraExportModalProps {
  tasks: TaskStats[];
  isOpen: boolean;
  onClose: () => void;
}

export const JiraExportModal: React.FC<JiraExportModalProps> = ({
  tasks,
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'auth' | 'select' | 'preview' | 'creating'>(
    'auth'
  );
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [epics, setEpics] = useState<JiraIssue[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEpic, setSelectedEpic] = useState('');
  const [createResults, setCreateResults] = useState<JiraCreateResult[]>([]);

  // ... implementación del componente
};
```

## Costos y Limitaciones

### Costos de Jira Cloud

- **Free**: Hasta 10 usuarios
- **Standard**: $7.50/usuario/mes
- **Premium**: $14.50/usuario/mes
- **Enterprise**: Precio personalizado

### Limitaciones de API

- Rate limits: 10,000 requests/hora por app
- Bulk operations: Máximo 50 issues por request
- Custom fields: Dependiente de la configuración del proyecto

## Beneficios

1. **Flujo Completo**: Estimación → Planificación → Desarrollo
2. **Trazabilidad**: Mantener contexto de las estimaciones
3. **Automatización**: Reducir trabajo manual significativamente
4. **Consistencia**: Formato estándar para todas las historias
5. **Metadatos**: Preservar información valiosa del proceso de estimación

## Siguientes Pasos

1. Configurar OAuth app en Atlassian
2. Implementar autenticación
3. Crear servicios de API
4. Desarrollar UI de exportación
5. Testing e integración
6. Documentación para usuarios finales

## Consideraciones de Seguridad

- Tokens almacenados de forma segura
- Refresh tokens para sesiones largas
- Validación de permisos por proyecto
- Logs de auditoría para exportaciones
