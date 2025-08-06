import React from 'react';
import './KPICard.scss';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}) => {
  return (
    <div className={`kpi-card kpi-card--${color}`}>
      <div className="kpi-card__header">
        <div className="kpi-card__title">{title}</div>
        {icon && <div className="kpi-card__icon">{icon}</div>}
      </div>

      <div className="kpi-card__value">{value}</div>

      {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}

      {trend && (
        <div
          className={`kpi-card__trend ${trend.isPositive ? 'kpi-card__trend--positive' : 'kpi-card__trend--negative'}`}
        >
          <span className="kpi-card__trend-value">
            {trend.isPositive ? '+' : ''}
            {trend.value}
          </span>
          <span className="kpi-card__trend-label">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
