// Tipos para las respuestas de analytics del backend

export interface CompanyStatusData {
  status: 'active' | 'suspended' | 'trial' | 'inactive' | string;
  count: number | string;
}

export interface UserRoleData {
  role:
    | 'user'
    | 'manager'
    | 'company_admin'
    | 'viewer'
    | 'super_admin'
    | string;
  count: number | string;
}

export interface UserStatusData {
  status: 'active' | 'inactive' | 'suspended' | 'pending' | string;
  count: number | string;
}

export interface TopCompanyData {
  company_name: string;
  conmpany_slug: string;
  company_id: string;
  userCount: string;
}

export interface GlobalAnalytics {
  companies: {
    total: number;
    byStatus: CompanyStatusData[];
    newLast30Days: number;
    topByUsers: TopCompanyData[];
  };
  users: {
    total: number;
    byRole: UserRoleData[];
    byStatus: UserStatusData[];
    newLast30Days: number;
    activeLast30Days: number;
  };
  platform: {
    averageUsersPerCompany: string;
    activeCompaniesPercentage: number;
  };
}

export interface GlobalAnalyticsResponse {
  success: boolean;
  data: GlobalAnalytics;
}

// Datos procesados para los gráficos
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface BarChartData {
  name: string;
  value: number;
  fill?: string;
}
