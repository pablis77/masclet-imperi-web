import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

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
    <div className="mb-4 p-3 border rounded bg-light">
      <h5 className="mb-3">Filtros</h5>
      <Form>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Explotación</Form.Label>
              <Form.Select
                value={explotacionId || ''}
                onChange={(e) => setExplotacionId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Todas las explotaciones</option>
                {explotaciones.map((explotacion) => (
                  <option key={explotacion.id} value={explotacion.id}>
                    {explotacion.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Fecha de inicio</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Fecha de fin</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-end">
          <Button variant="outline-secondary" className="me-2" onClick={handleReset}>
            Restablecer
          </Button>
          <Button variant="primary" onClick={handleApplyFilters}>
            Aplicar filtros
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default DashboardFilters;
