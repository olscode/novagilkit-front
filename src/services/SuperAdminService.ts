import axios, { AxiosError } from 'axios';
import { GlobalAnalyticsResponse } from '../types/analytics';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para los datos de licencia
export type LicenseData = {
  id: string;
  planType: 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
  status?: 'active' | 'expired' | 'suspended' | 'cancelled';
  maxUsers?: number;
  maxProjects?: number;
  maxStorageMB?: number;
  customBranding?: boolean;
  features?: any;
  startDate: string | null; // Puede ser null si no hay fecha de inicio
  endDate: string | null; // Puede ser null si no hay fecha de finalización
  trialEndDate: string | null; // Puede ser null si no hay periodo de prueba
  monthlyPrice?: number | string;
  yearlyPrice?: number | string;
  paymentMethod?: string;
  externalSubscriptionId?: string;
  companyId?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CompanyUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  company?: Company;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export type GetAllUsersResponse = {
  success: boolean;
  data: {
    users: CompanyUser[];
    total: number;
    page: number;
    limit: number;
  };
};

export type GetAllUsersParams = {
  page?: number;
  limit?: number;
  companyId?: string;
  role?: string;
  status?: string;
  // Nota: 'search' se maneja localmente en el frontend
  // ya que el backend no tiene soporte para búsqueda por nombre/apellido/email
};

// Error handler para 401/403
function handleAuthError(error: AxiosError) {
  if (
    error.response &&
    (error.response.status === 401 || error.response.status === 403)
  ) {
    // Puedes personalizar el manejo aquí (redirección, logout, etc)
    throw new Error('No autorizado o sin permisos.');
  }
  throw error;
}

export const SuperAdminService = {
  // 15. Obtener usuarios
  async getAllUsers(params: GetAllUsersParams) {
    try {
      const { data } = await apiClient.get('/companies/users/all', { params });
      return data;
    } catch (error) {
      console.error('❌ Error en API getAllUsers:', error);
      handleAuthError(error as AxiosError);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // 13. Crear licencia de empresa
  async createCompanyLicense(companyId: string, licenseData: LicenseData) {
    try {
      const { data } = await apiClient.post(
        `/companies/${companyId}/license`,
        licenseData
      );
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // 14. Actualizar licencia de empresa
  async updateCompanyLicense(
    companyId: string,
    licenseData: Partial<LicenseData>
  ) {
    try {
      const { data } = await apiClient.put(
        `/companies/${companyId}/license`,
        licenseData
      );
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
  // 1. Listar todas las empresas
  async getCompanies(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    try {
      const { data } = await apiClient.get('/companies', { params });
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 2. Crear nueva empresa
  async createCompany(body: {
    name: string;
    slug?: string;
    description?: string;
    adminEmail: string;
    website?: string;
    phone?: string;
    logo?: string;
    address?: string;
    status?: 'active' | 'suspended' | 'trial' | 'inactive';
  }) {
    try {
      const { data } = await apiClient.post('/companies', body);
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 3. Obtener empresa específica
  async getCompany(id: string) {
    try {
      const { data } = await apiClient.get(`/companies/${id}`);
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 4. Actualizar empresa
  async updateCompany(
    id: string,
    body: Partial<{
      name: string;
      slug?: string;
      description?: string;
      adminEmail?: string;
      website?: string;
      phone?: string;
      logo?: string;
      address?: string;
      status?: 'active' | 'suspended' | 'trial' | 'inactive';
      [key: string]: any;
    }>
  ) {
    try {
      const { data } = await apiClient.put(`/companies/${id}`, body);
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 5. Eliminar empresa
  async deleteCompany(id: string) {
    try {
      const { data } = await apiClient.delete(`/companies/${id}`);
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 6. Estadísticas de empresa específica
  async getCompanyStats(id: string) {
    try {
      const { data } = await apiClient.get(`/companies/${id}/stats`);
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 7. Analytics globales
  async getGlobalAnalytics(): Promise<GlobalAnalyticsResponse> {
    try {
      const { data } = await apiClient.get('/companies/analytics/global');
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // 8. Suspender empresa
  async suspendCompany(id: string) {
    try {
      const { data } = await apiClient.put(`/companies/${id}/suspend`);
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 9. Activar empresa
  async activateCompany(id: string) {
    try {
      const { data } = await apiClient.put(`/companies/${id}/activate`);
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 11. Transferir usuario entre empresas
  async transferUser(
    userId: string,
    body: { targetCompanyId: string; reason: string }
  ) {
    try {
      const { data } = await apiClient.put(
        `/companies/users/${userId}/transfer`,
        body
      );
      return data;
    } catch (error) {
      handleAuthError(error as AxiosError);
    }
  },

  // 12. Registrar usuario como Super Admin (puede especificar companyId)
  async createUserAsSuperAdmin(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'user' | 'manager' | 'company_admin' | 'viewer';
    phone?: string;
    companyId: string;
  }) {
    try {
      const { data: response } = await apiClient.post('/auth/register', data);
      return response;
    } catch (error) {
      handleAuthError(error as AxiosError);
      // Mensaje descriptivo para otros errores
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
};

export default SuperAdminService;
