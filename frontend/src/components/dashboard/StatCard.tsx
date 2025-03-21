import React from 'react';
import { Card } from '../ui';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
  className?: string;
  trend?: number;
  description?: string;
}

/**
 * Tarjeta de estadísticas para el dashboard
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = 'primary',
  icon,
  className = '',
  trend = 0,
  description,
}) => {
  // Mapeo de colores a clases de Tailwind
  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-300 border-primary-200 dark:border-primary-700',
    secondary: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  };

  const valueColorClasses = {
    primary: 'text-primary dark:text-primary-300',
    secondary: 'text-gray-800 dark:text-gray-200',
    success: 'text-green-600 dark:text-green-300',
    danger: 'text-red-600 dark:text-red-300',
    warning: 'text-yellow-600 dark:text-yellow-300',
    info: 'text-blue-600 dark:text-blue-300',
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color]} ${className} h-full`}>
      <div className="p-3 sm:p-4 flex items-center">
        {icon && (
          <div className="mr-3 sm:mr-4 flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className={`text-2xl font-bold ${valueColorClasses[color]}`}>
            {value}
            {trend !== 0 && (
              <span className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
          </p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
