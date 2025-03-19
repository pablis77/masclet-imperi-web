import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import DashboardFilters from './DashboardFilters';
import StatsCard from './StatsCard';
import GenderDistributionChart from './GenderDistributionChart';
import StatusDistributionChart from './StatusDistributionChart';
import PartosChart from './PartosChart';
import { getDashboardStats, DashboardResponse, DashboardParams } from '../../services/dashboardService';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [filters, setFilters] = useState<DashboardParams>({});

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async (params: DashboardParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats(params);
      setStats(data);
    } catch (err: any) {
      console.error('Error al cargar estadísticas del dashboard', err);
      setError(err.response?.data?.detail || 'Error al cargar las estadísticas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
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

  // Manejar cambios en los filtros
  const handleApplyFilters = (newFilters: DashboardParams) => {
    setFilters(newFilters);
    loadDashboardStats(newFilters);
  };

  // Formatear valores para mostrar
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Filtros */}
      <DashboardFilters 
        onApplyFilters={handleApplyFilters}
        // TODO: Cargar explotaciones disponibles desde la API
        explotaciones={[
          { id: 1, nombre: 'Explotación 1' },
          { id: 2, nombre: 'Explotación 2' }
        ]}
      />
      
      {/* Mensaje de error */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Indicador de carga */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando estadísticas...</p>
        </div>
      ) : stats ? (
        <>
          {/* Información del periodo */}
          <div className="mb-4">
            <h5>
              {stats.explotacio_name 
                ? `Estadísticas de: ${stats.explotacio_name}` 
                : 'Estadísticas generales'}
            </h5>
            <p className="text-muted">
              Periodo: {new Date(stats.fecha_inicio).toLocaleDateString()} - {new Date(stats.fecha_fin).toLocaleDateString()}
            </p>
          </div>
          
          {/* Tarjetas de estadísticas principales */}
          <Row className="mb-4">
            <Col md={3}>
              <StatsCard 
                title="Total de Animales" 
                value={formatNumber(stats.animales.total)}
                icon="bi-database"
                color="primary"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Ratio Machos/Hembras" 
                value={stats.animales.ratio_machos_hembras.toFixed(2)}
                icon="bi-gender-ambiguous"
                color="info"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Total de Partos" 
                value={formatNumber(stats.partos.total)}
                icon="bi-calendar-event"
                color="success"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Partos Último Mes" 
                value={formatNumber(stats.partos.ultimo_mes)}
                icon="bi-calendar-check"
                color="warning"
                subtext={`Promedio mensual: ${stats.partos.promedio_mensual.toFixed(1)}`}
              />
            </Col>
          </Row>
          
          {/* Gráficos */}
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <GenderDistributionChart 
                machos={stats.animales.machos} 
                hembras={stats.animales.hembras} 
              />
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <StatusDistributionChart porEstado={stats.animales.por_estado} />
            </Col>
            <Col lg={4} md={12} className="mb-4">
              <StatsCard 
                title="Distribución por Amamantamiento" 
                value={Object.entries(stats.animales.por_alletar)
                  .map(([key, value]) => `${key === '0' ? 'No' : key === '1' ? 'Sí' : 'Parcial'}: ${value}`)
                  .join(' | ')}
                icon="bi-list-check"
                color="secondary"
              />
            </Col>
          </Row>
          
          <Row>
            <Col md={12} className="mb-4">
              <PartosChart 
                porMes={stats.partos.por_mes} 
                tendencia={stats.partos.tendencia_partos} 
              />
            </Col>
          </Row>
          
          {/* Tarjetas adicionales si hay más datos */}
          {Object.keys(stats.animales.por_quadra).length > 0 && (
            <Row>
              <Col md={12} className="mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Distribución por Cuadra</h5>
                    <div className="d-flex flex-wrap">
                      {Object.entries(stats.animales.por_quadra).map(([cuadra, cantidad]) => (
                        <div key={cuadra} className="me-4 mb-3">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle me-2" 
                              style={{ 
                                width: '10px', 
                                height: '10px', 
                                backgroundColor: `hsl(${parseInt(cuadra) * 137.5 % 360}, 70%, 50%)` 
                              }}
                            ></div>
                            <div>
                              <span className="fw-bold">{cuadra}</span>: {cantidad} animales
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Alert variant="info">No hay datos disponibles para mostrar.</Alert>
      )}
    </Container>
  );
};

export default Dashboard;
