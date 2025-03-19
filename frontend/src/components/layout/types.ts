/**
 * Tipos para componentes de layout
 */

// Roles de usuario
export type UserRole = 'administrador' | 'gerente' | 'editor' | 'usuario';

// Estructura para ítems de menú
export interface MenuItem {
  name: string;
  url: string;
  icon: string; // URL de imagen o emoji
  iconClass?: string;
  roles: UserRole[];
  badge?: string | number; // Badge opcional (ej: contador de notificaciones)
}

// Estructura para secciones de menú
export interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Props compartidas por varios componentes de layout
export interface LayoutComponentProps {
  userRole?: UserRole;
  currentPath?: string;
}

// Props específicas para Navbar
export interface NavbarProps extends LayoutComponentProps {
  title?: string;
}

// Props específicas para Sidebar
export interface SidebarProps extends LayoutComponentProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

// Props específicas para Footer
export interface FooterProps {
  showVersion?: boolean;
  version?: string;
}

// Props para el layout principal
export interface MainLayoutProps {
  userRole?: UserRole;
  currentPath?: string; 
  title?: string;
  version?: string;
  children?: React.ReactNode;
}
