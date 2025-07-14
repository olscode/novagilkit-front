/**
 * Servicio simplificado para comunicarse con el backend de Jira
 * Reemplaza la lógica compleja del JiraApiService
 */

export interface JiraAuthResponse {
  success: boolean;
  authUrl?: string;
  state?: string;
  error?: string;
}

export interface JiraValidateResponse {
  valid: boolean;
  user?: {
    accountId: string;
    displayName: string;
    emailAddress: string;
  };
  instance?: {
    cloudId: string;
    url: string;
    name: string;
  };
  error?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
}

export interface JiraEpic {
  id: string;
  key: string;
  summary: string;
  status: {
    name: string;
    statusCategory: {
      key: string;
      name: string;
    };
  };
}

export interface JiraExportRequest {
  projectKey: string;
  epicKey?: string;
  createNewEpic?: boolean;
  newEpicSummary?: string;
  tasks: Array<{
    id: string;
    description: string;
    average: number;
    median: number;
    consensus: number;
    min: number;
    max: number;
    count: number;
    votes: Record<string, number>;
  }>;
}

export interface JiraExportResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface JiraExportStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    completed: number;
    total: number;
    currentTask?: string;
  };
  results?: Array<{
    success: boolean;
    taskId: string;
    taskDescription: string;
    jiraKey?: string;
    jiraUrl?: string;
    error?: string;
  }>;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export class JiraBackendService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/jira') {
    this.baseUrl = baseUrl;
  }

  /**
   * Iniciar el flujo de autenticación OAuth
   */
  async startAuth(): Promise<JiraAuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting auth:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validar si el usuario tiene una sesión válida
   */
  async validateSession(): Promise<JiraValidateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        credentials: 'include', // Incluir cookies de sesión
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();

      // El backend devuelve: {success: true, valid: true, user: {...}, cloudId: "..."}
      if (data.success && data.valid && data.user) {
        return {
          valid: true,
          user: data.user,
          instance: {
            cloudId: data.cloudId,
            url: `https://${data.user.site || 'unknown'}.atlassian.net`,
            name: data.user.site || 'Jira Instance',
          },
        };
      } else {
        // No válido o error
        return {
          valid: false,
          error: data.error || 'Sesión no válida',
        };
      }
    } catch (error) {
      console.error('Error validating session:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtener proyectos accesibles
   */
  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Obtener epics de un proyecto
   */
  async getEpics(projectKey: string): Promise<JiraEpic[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/projects/${projectKey}/epics`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 Raw epics data from backend:', data);

      // Procesar las épicas desde la respuesta de Jira
      let epics = data.epics || [];
      if (Array.isArray(epics)) {
        epics = epics.map((epic: any) => {
          // Si el epic tiene un campo 'fields', extraer la información de ahí
          if (epic.fields) {
            return {
              id: epic.id,
              key: epic.key,
              summary: epic.fields.summary || `Épica ${epic.key}`,
              status: epic.fields.status || {
                name: 'Unknown',
                statusCategory: { key: 'unknown', name: 'Unknown' },
              },
            };
          }
          // Si ya está en el formato correcto, devolverlo tal como está
          return epic;
        });
      }

      console.log('📋 Processed epics:', epics);
      return epics;
    } catch (error) {
      console.error('Error fetching epics:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva epic
   */
  async createEpic(
    projectKey: string,
    summary: string,
    description?: string
  ): Promise<JiraEpic> {
    try {
      const response = await fetch(
        `${this.baseUrl}/projects/${projectKey}/epics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            summary,
            description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.epic;
    } catch (error) {
      console.error('Error creating epic:', error);
      throw error;
    }
  }

  /**
   * Exportar tareas a Jira
   */
  async exportTasks(
    exportData: JiraExportRequest
  ): Promise<JiraExportResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting tasks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtener el estado de una exportación
   */
  async getExportStatus(jobId: string): Promise<JiraExportStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/export/${jobId}/status`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Job no encontrado
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // El backend devuelve: {success: true, job: {...}}
      if (data.success && data.job) {
        return data.job;
      } else {
        // Formato anterior o error
        return data.success ? data : null;
      }
    } catch (error) {
      console.error('Error fetching export status:', error);
      throw error;
    }
  }

  /**
   * Cancelar una exportación
   */
  async cancelExport(jobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/export/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling export:', error);
      return false;
    }
  }

  /**
   * Obtener todas las exportaciones del usuario
   */
  async getExports(): Promise<JiraExportStatus[]> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.exports || [];
    } catch (error) {
      console.error('Error fetching exports:', error);
      throw error;
    }
  }

  /**
   * Limpiar la sesión (logout)
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}

// Instancia singleton
export const jiraBackendService = new JiraBackendService();
