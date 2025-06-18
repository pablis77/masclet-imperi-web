/**
 * Este archivo garantiza que los componentes estructurales críticos 
 * se incluyan explícitamente en el proceso de build de Astro/Vite.
 * 
 * Estos componentes son esenciales para el funcionamiento correcto
 * de todas las secciones de la aplicación.
 */

import MainLayoutComponent from '../components/layout/MainLayout';
import NavbarComponent from '../components/layout/Navbar';
import SidebarComponent from '../components/layout/Sidebar';
import FooterComponent from '../components/layout/Footer';

// Importar protección DOM para prevenir errores en scripts hoisted
import { DOMProtection } from './dom-protection';

// Exportar explícitamente los componentes para evitar tree-shaking
export const MainLayout = MainLayoutComponent;
export const Navbar = NavbarComponent;
export const Sidebar = SidebarComponent;
export const Footer = FooterComponent;

// Forzar el uso mínimo de los componentes para evitar tree-shaking
export const ensureCoreComponents = () => {
  console.log('Core components loaded', { MainLayout, Navbar, Sidebar, Footer });
  return { MainLayout, Navbar, Sidebar, Footer };
};

// También exportar por defecto para garantizar inclusión
export default {
  MainLayout,
  Navbar,
  Sidebar,
  Footer,
  ensureCoreComponents,
  DOMProtection // Exportar DOMProtection para asegurar su inclusión
};

// Inicializar protección DOM para asegurar que se incluya en el build
if (typeof DOMProtection !== 'undefined') {
  console.log('✅ DOMProtection cargada correctamente');
}
