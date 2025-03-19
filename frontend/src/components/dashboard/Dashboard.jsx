import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboardService';
import DashboardFilters from './DashboardFilters';

// Componentes del Dashboard
const DashboardComponent = () => {
  const [loading, setLoading] = useState(false); // Inicialmente false para pruebas
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulación de datos para pruebas mientras no hay API
      // En producción, descomentar la siguiente línea:
      // const data = await getDashboardStats(params);
      
      // Datos de prueba
      const data = {
        explotacio_name: params.explotacioId ? 'Explotación de Prueba' : 'Todas las Explotaciones',
        fecha_inicio: params.startDate || '2024-01-01',
        fecha_fin: params.endDate || '2024-12-31',
        animales: {
          total: 120,
          machos: 45,
          hembras: 75,
          ratio_machos_hembras: 0.6,
          por_estado: { 'OK': 105, 'DEF': 15 },
          por_alletar: { 'true': 30, 'false': 90 },
          por_quadra: { 'Cuadra 1': 40, 'Cuadra 2': 50, 'Cuadra 3': 30 }
        },
        partos: {
          total: 50,
          ultimo_mes: 8,
          ultimo_año: 48,
          promedio_mensual: 4,
          por_mes: { 'Ene': 5, 'Feb': 3, 'Mar': 6, 'Abr': 4, 'May': 3, 'Jun': 5, 'Jul': 4, 'Ago': 3, 'Sep': 5, 'Oct': 4, 'Nov': 2, 'Dic': 6 },
          tendencia_partos: {
            tendencia: 0.15,
            promedio: 4.2,
            valores: { '2024-01': 5, '2024-02': 3, '2024-03': 6, '2024-04': 4, '2024-05': 3, '2024-06': 5 }
          }
        }
      };
      
      setStats(data);
      // Establecer loading a false inmediatamente para datos de prueba
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar estadísticas del dashboard', err);
      setError(err.response?.data?.detail || 'Error al cargar las estadísticas. Intente nuevamente.');
      setLoading(false);
    }
  };

  // Manejar cambios en los filtros
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    loadDashboardStats(newFilters);
  };

  // Cargar estadísticas iniciales al montar el componente
  useEffect(() => {
    // Establecer fechas predeterminadas - último año
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const initialFilters = {
      startDate: startDate.toISOString().split('T')[0],
      endDate
    };
    
    setFilters(initialFilters);
    loadDashboardStats(initialFilters);
  }, []);

  // Formatear valores para mostrar
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary mb-4"></div>
        <p className="text-text-secondary font-medium">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border-l-4 border-danger rounded-md text-danger p-5 mb-6 shadow-sm" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-warning/10 border-l-4 border-warning rounded-md text-warning p-5 mb-6 shadow-sm" role="alert">
        <p className="font-bold">Sin datos</p>
        <p>No se encontraron estadísticas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Filtros */}
      <DashboardFilters 
        onApplyFilters={handleApplyFilters}
        explotaciones={[
          { id: 1, nombre: 'Explotación 1' },
          { id: 2, nombre: 'Explotación 2' }
        ]}
      />
      
      {/* Información del periodo */}
      <div className="mb-8 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h5 className="text-xl font-semibold text-secondary mb-1">
          {stats.explotacio_name 
            ? `Estadísticas de: ${stats.explotacio_name}` 
            : 'Estadísticas generales'}
        </h5>
        <p className="text-text-secondary">
          Periodo: <span className="font-medium">{new Date(stats.fecha_inicio).toLocaleDateString()}</span> - <span className="font-medium">{new Date(stats.fecha_fin).toLocaleDateString()}</span>
        </p>
      </div>
      
      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total de animales */}
        <div className="stats-card">
          <h6 className="stats-card-title">TOTAL ANIMALES</h6>
          <p className="stats-card-value">{formatNumber(stats.animales.total)}</p>
          <div className="stats-card-footer">
            <span>
              <span className="text-info font-medium">♂️ {formatNumber(stats.animales.machos)}</span> machos
            </span>
            <span>
              <span className="text-pink-500 font-medium">♀️ {formatNumber(stats.animales.hembras)}</span> hembras
            </span>
          </div>
        </div>

        {/* Estado animales */}
        <div className="stats-card">
          <h6 className="stats-card-title">ESTADO</h6>
          <div className="flex items-end space-x-5">
            <div>
              <p className="text-3xl font-bold text-success">{formatNumber(stats.animales.por_estado['OK'] || 0)}</p>
              <p className="text-sm text-text-secondary">Estado OK</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-danger">{formatNumber(stats.animales.por_estado['DEF'] || 0)}</p>
              <p className="text-sm text-text-secondary">Estado DEF</p>
            </div>
          </div>
          <div className="stats-card-footer">
            <span>Total: {formatNumber(stats.animales.total)}</span>
            <span className="animal-status-ok py-1 px-2">
              {Math.round((stats.animales.por_estado['OK'] / stats.animales.total) * 100)}% OK
            </span>
          </div>
        </div>

        {/* Total de partos */}
        <div className="stats-card">
          <h6 className="stats-card-title">TOTAL PARTOS</h6>
          <p className="stats-card-value">{formatNumber(stats.partos.total)}</p>
          <div className="stats-card-footer">
            <span>Último mes: <span className="font-medium">{formatNumber(stats.partos.ultimo_mes)}</span></span>
            <span>Último año: <span className="font-medium">{formatNumber(stats.partos.ultimo_año)}</span></span>
          </div>
        </div>

        {/* Promedio partos */}
        <div className="stats-card">
          <h6 className="stats-card-title">PROMEDIO PARTOS</h6>
          <p className="stats-card-value">{formatNumber(stats.partos.promedio_mensual)}<span className="text-sm font-normal text-text-secondary ml-1">/ mes</span></p>
          <div className="stats-card-footer">
            <span>
              Tendencia: 
              <span className={stats.partos.tendencia_partos.tendencia > 0 ? 'text-success ml-1' : 'text-danger ml-1'}>
                {stats.partos.tendencia_partos.tendencia > 0 ? '↑' : '↓'} 
                {Math.abs(stats.partos.tendencia_partos.tendencia * 100).toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Información detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Distribución animales por cuadra */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-secondary">Animales por cuadra</h3>
          </div>
          <div className="card-body">
            {Object.entries(stats.animales.por_quadra).map(([quadra, cantidad]) => (
              <div key={quadra} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">{quadra}</span>
                  <span className="font-medium">{formatNumber(cantidad)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(cantidad / stats.animales.total) * 100}%` }}>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de partos por mes */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-secondary">Partos por mes</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {Object.entries(stats.partos.por_mes).map(([mes, cantidad]) => (
                <div key={mes} className="text-center">
                  <div className="w-full bg-gray-100 rounded-t-md py-1 px-2">
                    <span className="text-xs font-medium text-text-secondary">{mes}</span>
                  </div>
                  <div 
                    className="bg-primary/20 text-primary font-semibold rounded-b-md py-2"
                    style={{ 
                      height: `${(cantidad / Math.max(...Object.values(stats.partos.por_mes))) * 60 + 30}px`,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center'
                    }}
                  >
                    {cantidad}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
