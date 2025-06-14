import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Reemplazamos el Dashboard original por DashboardV2 que es el que se usa actualmente
// import Dashboard from '../components/dashboard/Dashboard'; // Ya no se usa
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
        
        {/* Dashboard - Ahora usa DashboardV2 para mantener consistencia con el resto de la app */}
        <Route path="/dashboard" element={<DashboardV2 />} />
        
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