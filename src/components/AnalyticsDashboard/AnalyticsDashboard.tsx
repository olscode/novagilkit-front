import React from 'react';
import { FaRegBuilding } from 'react-icons/fa';
import { FiActivity, FiPercent, FiTrendingUp, FiUsers } from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGlobalAnalytics } from '../../hooks/useGlobalAnalytics';
import { KPICard } from '../KPICard/KPICard';
import Spinner from '../Spinner/Spinner';
import './AnalyticsDashboard.scss';

// Componente para renderizar etiquetas personalizadas en el donut
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
}: any) => {
  // Validar que tenemos datos válidos
  if (!percent || isNaN(percent) || percent < 0.08 || !value || isNaN(value)) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  // Posicionar el texto un poco más hacia el centro del segmento
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percentageValue = (percent * 100).toFixed(0);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle" // Centrar horizontalmente
      dominantBaseline="central" // Centrar verticalmente
      fontSize="14"
      fontWeight="bold"
      style={{
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)', // Sombra para mejor legibilidad
        pointerEvents: 'none', // Evitar interferencia con hover
      }}
    >
      {`${percentageValue}%`}
    </text>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const {
    analytics,
    loading,
    error,
    refetch,
    companyStatusData,
    userRoleData,
    userStatusData,
    topCompaniesData,
  } = useGlobalAnalytics();

  if (loading) {
    return (
      <div className="analytics-dashboard__loading">
        <Spinner />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard__error">
        <h3>Error al cargar estadísticas</h3>
        <p>{error}</p>
        <button className="analytics-dashboard__retry-btn" onClick={refetch}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard__no-data">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-dashboard__header">
        <h2 className="analytics-dashboard__title">📊 Estadísticas Globales</h2>
        <button
          className="analytics-dashboard__refresh-btn"
          onClick={refetch}
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="analytics-dashboard__kpis">
        <KPICard
          title="Total Empresas"
          value={analytics.companies.total.toLocaleString()}
          subtitle="Empresas registradas"
          icon={<FaRegBuilding />}
          color="blue"
          trend={{
            value: analytics.companies.newLast30Days,
            label: 'nuevas últimos 30 días',
            isPositive: analytics.companies.newLast30Days > 0,
          }}
        />

        <KPICard
          title="Total Usuarios"
          value={analytics.users.total.toLocaleString()}
          subtitle="Usuarios registrados"
          icon={<FiUsers />}
          color="green"
          trend={{
            value: analytics.users.newLast30Days,
            label: 'nuevos últimos 30 días',
            isPositive: analytics.users.newLast30Days > 0,
          }}
        />

        <KPICard
          title="Usuarios Activos"
          value={analytics.users.activeLast30Days.toLocaleString()}
          subtitle="Últimos 30 días"
          icon={<FiActivity />}
          color="purple"
          trend={{
            value: Math.round(
              (analytics.users.activeLast30Days / analytics.users.total) * 100
            ),
            label: 'del total',
            isPositive: true,
          }}
        />

        <KPICard
          title="Promedio Usuarios/Empresa"
          value={analytics.platform.averageUsersPerCompany}
          subtitle="Por empresa"
          icon={<FiTrendingUp />}
          color="yellow"
        />

        <KPICard
          title="Empresas Activas"
          value={`${analytics.platform.activeCompaniesPercentage.toFixed(1)}%`}
          subtitle="Del total de empresas"
          icon={<FiPercent />}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="analytics-dashboard__charts">
        {/* Estado de Empresas - Donut */}
        <div className="analytics-dashboard__chart-card">
          <h3 className="analytics-dashboard__chart-title">
            🏢 Estado de Empresas
          </h3>
          <div className="analytics-dashboard__chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles de Usuarios - Donut */}
        <div className="analytics-dashboard__chart-card">
          <h3 className="analytics-dashboard__chart-title">
            👥 Distribución de Roles
          </h3>
          <div className="analytics-dashboard__chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estado de Usuarios - Donut */}
        <div className="analytics-dashboard__chart-card">
          <h3 className="analytics-dashboard__chart-title">
            📊 Estado de Usuarios
          </h3>
          <div className="analytics-dashboard__chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Empresas - Bar Chart */}
        <div className="analytics-dashboard__chart-card analytics-dashboard__chart-card--wide">
          <h3 className="analytics-dashboard__chart-title">
            🏆 Top 5 Empresas por Usuarios
          </h3>
          <div className="analytics-dashboard__chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topCompaniesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-color)"
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
