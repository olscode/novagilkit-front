// Tipos para importación de Jira
export interface JiraImportConfig {
  projectKey?: string;
  epicKey?: string;
  jql?: string;
  issueTypes?: string[];
}

export interface ImportedTask {
  id: string;
  jiraKey: string;
  jiraUrl: string;
  title: string;
  description: string;
  details: string;
  type: string;
  priority: string;
  status: string;
  assignee?: string;
  reporter?: string;
  labels: string[];
  components: string[];
  originalStoryPoints?: number;
  createdAt: Date;
  importedAt: Date;
  votes: Record<string, number>;
  average?: number;
  median?: number;
  consensus?: number;
}

export interface JiraImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  projectKey?: string;
  epicKey?: string;
  jql?: string;
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  tasks: ImportedTask[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JiraImportResponse {
  success: boolean;
  message?: string;
  data?: {
    jobId: string;
    status: string;
  };
  error?: string;
}

export interface JiraImportStatusResponse {
  success: boolean;
  data?: JiraImportJob;
  error?: string;
}

export interface JiraImportTasksResponse {
  success: boolean;
  data?: {
    tasks: ImportedTask[];
    total: number;
    progress: {
      total: number;
      completed: number;
      failed: number;
    };
  };
  error?: string;
}

class JiraImportService {
  private baseUrl = '/api/jira/import';

  async startImport(config: JiraImportConfig): Promise<JiraImportResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar importación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting import:', error);
      throw error;
    }
  }

  async getImportStatus(jobId: string): Promise<JiraImportStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al consultar estado');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting import status:', error);
      throw error;
    }
  }

  async getImportedTasks(jobId: string): Promise<JiraImportTasksResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}/tasks`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener tareas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting imported tasks:', error);
      throw error;
    }
  }

  async cancelImport(jobId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar importación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling import:', error);
      throw error;
    }
  }

  async getImportStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting import stats:', error);
      throw error;
    }
  }
}

export const jiraImportService = new JiraImportService();
export default jiraImportService;
