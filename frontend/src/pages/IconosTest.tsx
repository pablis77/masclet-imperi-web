import React from 'react';
import IconoAnimal from '../components/ui/IconoAnimal';
import OptimizedImage from '../components/ui/OptimizedImage';

/**
 * Página de prueba para comparar diferentes versiones de iconos de animales
 */
const IconosTest: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de Iconos de Animales</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna 1: Nuevos iconos SVG */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Nuevos Iconos SVG</h2>
          <p className="text-gray-600 mb-4">Iconos ligeros y escalables en formato SVG</p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="toro" tamaño={48} />
                <span className="mt-2 text-sm">Toro (1KB)</span>
              </div>
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="toro" tamaño={32} />
                <span className="mt-2 text-sm">Toro (32px)</span>
              </div>
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="toro" tamaño={24} />
                <span className="mt-2 text-sm">Toro (24px)</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="vaca" tamaño={48} />
                <span className="mt-2 text-sm">Vaca (1KB)</span>
              </div>
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="vaca" tamaño={32} />
                <span className="mt-2 text-sm">Vaca (32px)</span>
              </div>
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="vaca" tamaño={24} />
                <span className="mt-2 text-sm">Vaca (24px)</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="vaca_amamantando" tamaño={48} />
                <span className="mt-2 text-sm">Vaca amamantando (1KB)</span>
              </div>
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="vaca_amamantando" tamaño={32} />
                <span className="mt-2 text-sm">Vaca amamantando (32px)</span>
              </div>
              <div className="flex flex-col items-center">
                <IconoAnimal tipo="vaca_amamantando" tamaño={24} />
                <span className="mt-2 text-sm">Vaca amamantando (24px)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna 2: Iconos PNG optimizados */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Iconos PNG Optimizados</h2>
          <p className="text-gray-600 mb-4">Versiones optimizadas de los PNG originales</p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <OptimizedImage src="/images/toro.png" alt="Toro PNG" width={48} height={48} />
                <span className="mt-2 text-sm">Toro (optimizado)</span>
              </div>
              <div className="flex flex-col items-center">
                <OptimizedImage src="/images/vaca blanca.png" alt="Vaca PNG" width={48} height={48} />
                <span className="mt-2 text-sm">Vaca (optimizado)</span>
              </div>
              <div className="flex flex-col items-center">
                <OptimizedImage src="/images/vaca azul.png" alt="Vaca Azul PNG" width={48} height={48} />
                <span className="mt-2 text-sm">Vaca azul (optimizado)</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <OptimizedImage 
                  src="/images/vaca_azul_amamantando_ternero_azul_sinfondo_transparente_dentro_circulo.png" 
                  alt="Vaca amamantando PNG" 
                  width={48} 
                  height={48} 
                />
                <span className="mt-2 text-sm">Vaca amamantando (opt.)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Comparación en Tabla</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Tipo</th>
                <th className="py-2 px-4 border-b text-center">SVG</th>
                <th className="py-2 px-4 border-b text-center">PNG Optimizado</th>
                <th className="py-2 px-4 border-b text-left">Comentarios</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">Toro</td>
                <td className="py-2 px-4 border-b text-center">
                  <IconoAnimal tipo="toro" tamaño={32} />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <OptimizedImage src="/images/toro.png" alt="Toro PNG" width={32} height={32} />
                </td>
                <td className="py-2 px-4 border-b">SVG ≈1KB vs PNG ≈66KB</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Vaca</td>
                <td className="py-2 px-4 border-b text-center">
                  <IconoAnimal tipo="vaca" tamaño={32} />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <OptimizedImage src="/images/vaca blanca.png" alt="Vaca PNG" width={32} height={32} />
                </td>
                <td className="py-2 px-4 border-b">SVG ≈1KB vs PNG ≈93KB</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Vaca amamantando</td>
                <td className="py-2 px-4 border-b text-center">
                  <IconoAnimal tipo="vaca_amamantando" tamaño={32} />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <OptimizedImage 
                    src="/images/vaca_azul_amamantando_ternero_azul_sinfondo_transparente_dentro_circulo.png" 
                    alt="Vaca amamantando PNG" 
                    width={32} 
                    height={32} 
                  />
                </td>
                <td className="py-2 px-4 border-b">SVG ≈1.3KB vs PNG ≈103KB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">¿Cómo usar los iconos?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">Usando SVG:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {'import IconoAnimal from \'../components/ui/IconoAnimal\';\n\n// Luego, en tu JSX:\n<IconoAnimal tipo="toro" tamaño={32} />\n<IconoAnimal tipo="vaca" />\n<IconoAnimal tipo="vaca_amamantando" />'}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Usando PNG optimizados:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {'import OptimizedImage from \'../components/ui/OptimizedImage\';\n\n// Luego, en tu JSX:\n<OptimizedImage src="/images/toro.png" alt="Toro" width={32} height={32} />\n<OptimizedImage src="/images/vaca blanca.png" alt="Vaca" width={32} height={32} />'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconosTest;
