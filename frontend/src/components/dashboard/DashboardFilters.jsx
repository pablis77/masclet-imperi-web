import React, { useState } from 'react';

const DashboardFilters = ({ onApplyFilters, explotaciones = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [explotacionId, setExplotacionId] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Establecer fechas predeterminadas al montar el componente - último año
  React.useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const handleReset = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
    setExplotacionId('');
    
    onApplyFilters({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const filters = {
      startDate,
      endDate
    };
    
    if (explotacionId) {
      filters.explotacioId = Number(explotacionId);
    }
    
    onApplyFilters(filters);
    setShowFilters(false);
  };

  return (
    <div className="mb-6">
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="btn btn-secondary mb-2 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
      </button>
      
      {showFilters && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="font-semibold text-secondary">Filtros de dashboard</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleApplyFilters}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="form-group">
                  <label className="form-label">Explotación</label>
                  <select
                    value={explotacionId}
                    onChange={(e) => setExplotacionId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Todas las explotaciones</option>
                    {explotaciones.map((explotacion) => (
                      <option key={explotacion.id} value={explotacion.id}>
                        {explotacion.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Fecha inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Fecha fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary"
                >
                  Restablecer
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Aplicar filtros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
