import React from 'react';
import { Card } from '../ui';
import { AnimalIcon } from '../icons';
import type { Activity as ApiActivity, ActivityType as ApiActivityType } from '../../services/dashboardService';

// Tipos de actividades que podemos mostrar
type ActivityType = 'animal_created' | 'animal_updated' | 'parto_registered' | 'user_login' | 'system_event' | 'explotacion_updated' | string;

// Estructura de una actividad
interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  entity_id?: number;
  entity_type?: string;
}

interface ActivityFeedProps {
  activities: ApiActivity[];
  title?: string;
  maxItems?: number;
  className?: string;
}

/**
 * Componente para mostrar actividad reciente en el dashboard
 */
const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Actividad reciente',
  maxItems = 5,
  className = '',
}) => {
  // Función para renderizar el icono según el tipo de actividad
  const renderActivityIcon = (activity: ApiActivity) => {
    switch (activity.type) {
      case 'animal_created':
      case 'new_animal':
        return (
          <div className="bg-green-100 dark:bg-green-900/30 p-1.5 sm:p-2 rounded-full">
            <AnimalIcon 
              type={'bull'} 
              size={20} 
              className="text-green-600 dark:text-green-400" 
            />
          </div>
        );
      case 'animal_updated':
      case 'update_animal':
        return (
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 sm:p-2 rounded-full">
            <AnimalIcon 
              type={'cow'} 
              size={20} 
              className="text-blue-600 dark:text-blue-400" 
            />
          </div>
        );
      case 'parto_registered':
      case 'new_parto':
        return (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 sm:p-2 rounded-full">
            <span className="text-lg sm:text-xl">🐄</span>
          </div>
        );
      case 'user_login':
        return (
          <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 sm:p-2 rounded-full">
            <span className="text-lg sm:text-xl">👤</span>
          </div>
        );
      case 'explotacion_updated':
        return (
          <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 sm:p-2 rounded-full">
            <span className="text-lg sm:text-xl">🏡</span>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 p-1.5 sm:p-2 rounded-full">
            <span className="text-lg sm:text-xl">📋</span>
          </div>
        );
    }
  };

  // Función para formatear la fecha relativa
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  };

  // Limitar el número de actividades a mostrar
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={`${className} h-full`}>
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">{title}</h3>
        
        {displayedActivities.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3 sm:py-4">
            No hay actividad reciente para mostrar
          </p>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {displayedActivities.map((activity) => (
              <li key={activity.id} className="flex items-start">
                <div className="mr-2 sm:mr-3 mt-1 flex-shrink-0">
                  {renderActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                      {activity.entity_id && (
                        <span className="ml-1 sm:ml-2 text-primary font-bold">#{activity.entity_id}</span>
                      )}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap sm:ml-2">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {activities.length > maxItems && (
          <div className="mt-3 sm:mt-4 text-center">
            <a href="#" className="text-primary hover:text-primary-dark text-xs sm:text-sm font-medium">
              Ver todas las actividades
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;
