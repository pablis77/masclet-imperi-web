import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  priority?: boolean; // Para imágenes que están en la parte superior de la página (above the fold)
}

/**
 * Componente de imagen optimizado que carga automáticamente una versión WebP con fallback 
 * a la imagen original, e implementa lazy loading para todas las imágenes excepto las prioritarias.
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  width,
  height,
  priority = false,
}) => {
  // Obtener la extensión original y el path base
  const extension = src.split('.').pop() || '';
  const basePath = src.substring(0, src.lastIndexOf('.'));
  
  // Crear la ruta para la versión WebP
  const webpSrc = `${basePath}.webp`;
  
  // Determinar si debe usar lazy loading
  const loadingAttribute: "lazy" | "eager" = priority ? 'eager' : 'lazy';
  
  // Propiedades comunes para ambos formatos
  const imageProps = {
    alt,
    className,
    style,
    width,
    height,
    loading: loadingAttribute,
  };

  return (
    <picture>
      {/* Fuente WebP para navegadores modernos */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* Fallback a la imagen original para navegadores que no soportan WebP */}
      <img 
        src={src} 
        {...imageProps} 
      />
    </picture>
  );
};

export default OptimizedImage;
