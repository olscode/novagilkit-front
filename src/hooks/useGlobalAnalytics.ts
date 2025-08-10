import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SuperAdminService } from '../services/SuperAdminService';
import { BarChartData, ChartData, GlobalAnalytics } from '../types/analytics';

export const useGlobalAnalytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SuperAdminService.getGlobalAnalytics();
      console.log('📊 Analytics Response:', response);
      console.log('📊 Analytics Data:', response.data);
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(
        `Error del backend: ${err.message || 'Error desconocido'}\n\nEste error indica que el backend necesita actualizar las consultas de fecha de sintaxis MongoDB a TypeORM.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchAnalytics();
    }
  }, []);

  // Funciones para procesar datos para los gráficos
  const getCompanyStatusChartData = (): ChartData[] => {
    if (!analytics) return [];

    console.log('🔍 Company Status Data:', analytics.companies.byStatus);

    const colors: { [key: string]: string } = {
      active: '#10B981', // Verde
      suspended: '#F59E0B', // Amarillo
      trial: '#3B82F6', // Azul
      inactive: '#EF4444', // Rojo
    };

    const statusLabels: { [key: string]: string } = {
      active: t('analytics.status.active'),
      suspended: t('analytics.status.pending'),
      trial: t('analytics.status.trial'),
      inactive: t('analytics.status.pending'),
    };

    const result = analytics.companies.byStatus
      .map((item) => ({
        name: statusLabels[item.status] || item.status,
        value: Number(item.count) || 0, // Convertir a número y fallback a 0
        color: colors[item.status] || '#6B7280',
      }))
      .filter((item) => item.value > 0); // Filtrar valores válidos

    console.log('🔍 Processed Company Status Data:', result);
    return result;
  };

  const getUserRoleChartData = (): ChartData[] => {
    if (!analytics) return [];

    console.log('🔍 User Role Data:', analytics.users.byRole);

    const colors: { [key: string]: string } = {
      user: '#8B5CF6', // Morado
      manager: '#06B6D4', // Cyan
      company_admin: '#F59E0B', // Amarillo
      viewer: '#6B7280', // Gris
      super_admin: '#EF4444', // Rojo - agregado por si viene del backend
    };

    const roleLabels: { [key: string]: string } = {
      user: t('analytics.roles.users'),
      manager: t('analytics.roles.admins'),
      company_admin: t('analytics.roles.admins'),
      viewer: t('analytics.roles.users'),
      super_admin: t('analytics.roles.superAdmin'),
    };

    const result = analytics.users.byRole
      .map((item) => ({
        name: roleLabels[item.role] || item.role,
        value: Number(item.count) || 0, // Convertir a número y fallback a 0
        color: colors[item.role] || '#6B7280',
      }))
      .filter((item) => item.value > 0); // Filtrar valores válidos

    console.log('🔍 Processed User Role Data:', result);
    return result;
  };

  const getUserStatusChartData = (): ChartData[] => {
    if (!analytics) return [];

    console.log('🔍 User Status Data:', analytics.users.byStatus);

    const colors: { [key: string]: string } = {
      active: '#10B981', // Verde
      inactive: '#EF4444', // Rojo
      suspended: '#F59E0B', // Amarillo
      pending: '#8B5CF6', // Morado
    };

    const statusLabels: { [key: string]: string } = {
      active: t('analytics.status.active'),
      inactive: t('analytics.status.pending'),
      suspended: t('analytics.status.pending'),
      pending: t('analytics.status.pending'),
    };

    const result = analytics.users.byStatus
      .map((item) => ({
        name: statusLabels[item.status] || item.status,
        value: Number(item.count) || 0, // Convertir a número y fallback a 0
        color: colors[item.status] || '#6B7280',
      }))
      .filter((item) => item.value > 0); // Filtrar valores válidos

    console.log('🔍 Processed User Status Data:', result);
    return result;
  };

  const getTopCompaniesChartData = (): BarChartData[] => {
    if (!analytics) return [];

    return analytics.companies.topByUsers
      .slice(0, 5) // Solo top 5
      .map((company) => ({
        name:
          company.company_name.length > 15
            ? `${company.company_name.substring(0, 15)}...`
            : company.company_name,
        value: Number(company.userCount),
        fill: '#3B82F6',
      }));
  };

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    // Datos procesados para gráficos
    companyStatusData: getCompanyStatusChartData(),
    userRoleData: getUserRoleChartData(),
    userStatusData: getUserStatusChartData(),
    topCompaniesData: getTopCompaniesChartData(),
  };
};
