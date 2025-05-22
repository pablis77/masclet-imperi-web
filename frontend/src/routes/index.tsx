import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import DashboardV2 from '../components/dashboardv2/DashboardV2';
import ImportCsv from '../components/imports/ImportCsv';
import Explotaciones from '../components/Explotaciones';
import IconosTest from '../pages/IconosTest';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal redirige al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Dashboard V2 - Nueva versión mejorada */}
        <Route path="/dashboard-v2" element={<DashboardV2 />} />
        
        {/* Importación */}
        <Route path="/import" element={<ImportCsv />} />
        
        {/* Explotaciones */}
        <Route path="/explotacions" element={<Explotaciones />} />
        
        {/* Página de prueba de iconos */}
        <Route path="/iconos-test" element={<IconosTest />} />
        
        {/* Otras rutas se añadirán aquí */}
        
        {/* Ruta de fallback - redirige a dashboard si la ruta no existe */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;