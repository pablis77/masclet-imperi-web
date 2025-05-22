import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Card, Title, Text } from '@tremor/react';
import apiService from '../../../services/apiService';

const DiagnosticoDataCard = () => {
  const [statsData, setStatsData] = useState<any>(null);
  const [resumenData, setResumenData] = useState<any>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener datos de diferentes endpoints
        const [statsResponse, resumenResponse, debugResponse] = await Promise.all([
          apiService.get('/dashboard/stats'),
          apiService.get('/dashboard/resumen/'),
          apiService.get('/diagnostico/dashboard-debug')
        ]);
        
        console.log('Stats data:', statsResponse);
        console.log('Resumen data:', resumenResponse);
        console.log('Debug data:', debugResponse);
        
        setStatsData(statsResponse);
        setResumenData(resumenResponse);
        setDebugData(debugResponse);
        
      } catch (err) {
        console.error('Error al cargar datos de diagnóstico:', err);
        setError('Error al cargar datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper para renderizar objetos anidados como texto
  const renderObject = (obj: any, level = 0): ReactNode => {
    if (!obj) return <span>null</span>;
    
    if (typeof obj !== 'object') {
      return <span>{String(obj)}</span>;
    }
    
    if (Array.isArray(obj)) {
      return (
        <div style={{ marginLeft: level * 20 + 'px' }}>
          [
          {obj.map((item, index) => (
            <div key={index}>
              {renderObject(item, level + 1)}
              {index < obj.length - 1 ? ',' : ''}
            </div>
          ))}
          ]
        </div>
      );
    }
    
    return (
      <div style={{ marginLeft: level * 20 + 'px' }}>
        {'{'}
        {Object.entries(obj).map(([key, value], index, arr) => (
          <div key={key}>
            <span style={{ fontWeight: 'bold' }}>{key}</span>: {renderObject(value as any, level + 1)}
            {index < arr.length - 1 ? ',' : ''}
          </div>
        ))}
        {'}'}
      </div>
    );
  };
  
  // Sección para comparar conteos importantes
  const renderComparacion = () => {
    if (!statsData || !statsData.animales) return null;
    
    const animales = statsData.animales;
    const totalReportado = animales.total || 0;
    const totalPorGenero = (animales.machos || 0) + (animales.hembras || 0);
    const totalPorEstado = Object.values(animales.por_estado || {}).reduce((sum: any, val: any) => sum + val, 0);
    
    return (
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <Title className="text-lg mb-2">Verificación de Conteos</Title>
        
        <div className="grid grid-cols-3 gap-4 mb-2">
          <Text className="font-bold">Concepto</Text>
          <Text className="font-bold">Valor</Text>
          <Text className="font-bold">Concuerda</Text>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-1">
          <Text>Total reportado</Text>
          <Text>{totalReportado}</Text>
          <Text>-</Text>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-1">
          <Text>Total por género</Text>
          <Text>{totalPorGenero}</Text>
          <Text className={totalPorGenero === totalReportado ? "text-green-600" : "text-red-600"}>
            {totalPorGenero === totalReportado ? "✓" : "✗"}
          </Text>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-1">
          <Text>Total por estado</Text>
          <Text>{totalPorEstado}</Text>
          <Text className={totalPorEstado === totalReportado ? "text-green-600" : "text-red-600"}>
            {totalPorEstado === totalReportado ? "✓" : "✗"}
          </Text>
        </div>
        
        <Title className="text-lg mt-4 mb-2">Conteos por Categoría</Title>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text className="font-bold mb-2">Por Género:</Text>
            <Text>Machos: {animales.machos || 0}</Text>
            <Text>Hembras: {animales.hembras || 0}</Text>
          </div>
          <div>
            <Text className="font-bold mb-2">Por Estado:</Text>
            {Object.entries(animales.por_estado || {}).map(([estado, cantidad]: [string, any]) => (
              <Text key={estado}>{estado}: {cantidad}</Text>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <Text className="font-bold mb-2">Por Amamantamiento:</Text>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(animales.por_alletar || {}).map(([estado, cantidad]: [string, any]) => (
              <Text key={estado}>Estado {estado}: {cantidad}</Text>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <Title>Datos de Diagnóstico</Title>
        <Text>Cargando datos...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <Title>Datos de Diagnóstico</Title>
        <Text className="text-red-600">{error}</Text>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <Title>Datos de Diagnóstico</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Esta tarjeta muestra los datos crudos del dashboard para diagnóstico.
      </Text>
      
      {renderComparacion()}
      
      <div className="mt-6">
        <details className="mb-4">
          <summary className="cursor-pointer font-semibold text-lg">
            Datos de Stats
          </summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs">{renderObject(statsData as Record<string, unknown>)}</pre>
          </div>
        </details>
        
        <details className="mb-4">
          <summary className="cursor-pointer font-semibold text-lg">
            Datos de Resumen
          </summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs">{renderObject(resumenData as Record<string, unknown>)}</pre>
          </div>
        </details>
        
        <details className="mb-4">
          <summary className="cursor-pointer font-semibold text-lg">
            Datos de Depuración
          </summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs">{renderObject(debugData as Record<string, unknown>)}</pre>
          </div>
        </details>
      </div>
    </Card>
  );
};

export default DiagnosticoDataCard;
