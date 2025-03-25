import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import ImportCsv from '../components/imports/ImportCsv';
import Explotaciones from '../components/Explotaciones';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal redirige al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Importación */}
        <Route path="/import" element={<ImportCsv />} />
        
        {/* Explotaciones */}
        <Route path="/explotacions" element={<Explotaciones />} />
        
        {/* Otras rutas se añadirán aquí */}
        
        {/* Ruta de fallback - redirige a dashboard si la ruta no existe */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;