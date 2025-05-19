import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from '../ui';

interface DashboardFiltersProps {
  onApplyFilters: (filters: {
    explotacionId?: number;
    startDate?: string;
    endDate?: string;
  }) => void;
  explotaciones?: { id: number; nombre: string }[];
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onApplyFilters,
  explotaciones = [],
}) => {
  const [explotacionId, setExplotacionId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Establecer fecha de inicio como hace un año por defecto
  useEffect(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
    
    const today = new Date();
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const handleApplyFilters = () => {
    onApplyFilters({
      explotacionId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleReset = () => {
    setExplotacionId(undefined);
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
    
    const today = new Date();
    setEndDate(today.toISOString().split('T')[0]);
    
    onApplyFilters({
      explotacionId: undefined,
      startDate: oneYearAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });
  };

  return (
    <Card className="mb-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Explotación
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={explotacionId || ''}
              onChange={(e) => setExplotacionId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todas las explotaciones</option>
              {explotaciones.map((explotacion) => (
                <option key={explotacion.id} value={explotacion.id}>
                  {explotacion.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de inicio
            </label>
            <Input
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de fin
            </label>
            <Input
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button 
            variant="secondary" 
            onClick={handleReset}
          >
            Restablecer
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApplyFilters}
          >
            Aplicar filtros
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DashboardFilters;
