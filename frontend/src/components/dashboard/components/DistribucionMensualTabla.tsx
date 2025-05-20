import React from 'react';

interface DistribucionMensualTablaProps {
  darkMode?: boolean;
  data?: Record<string, number>;
  fecha_actualizacion?: string;
}

const DistribucionMensualTabla: React.FC<DistribucionMensualTablaProps> = ({ darkMode = false, data, fecha_actualizacion }) => {
    // Nombres de los meses en español
  const nombresMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];
  
  // Equivalencia de abreviaturas con nombres completos
  const abreviaturas: Record<string, string> = {
    'Ene': 'Enero',
    'Feb': 'Febrero',
    'Mar': 'Marzo',
    'Abr': 'Abril',
    'May': 'Mayo',
    'Jun': 'Junio',
    'Jul': 'Julio',
    'Ago': 'Agosto',
    'Sep': 'Septiembre',
    'Oct': 'Octubre',
    'Nov': 'Noviembre',
    'Dic': 'Diciembre'
  };
  
  // Convertir datos de formato de API a formato de tabla
  const datosPartos = nombresMeses.map((mes, index) => {
    // Buscar valor correspondiente en data (puede venir como abreviatura)
    if (!data) return 0;
    
    // Intenta encontrar por nombre completo
    if (data[mes] !== undefined) return data[mes];
    
    // Intenta encontrar por abreviatura
    const abreviatura = Object.keys(abreviaturas).find(key => abreviaturas[key] === mes);
    if (abreviatura && data[abreviatura] !== undefined) return data[abreviatura];
    
    return 0;
  });
  
  // Calculamos totales y estadísticas
  const total = datosPartos.reduce((sum, value) => sum + value, 0);
  
  // Encontramos el mes con más partos
  let maxIndex = 0;
  let maxValue = datosPartos[0];
  for (let i = 1; i < datosPartos.length; i++) {
    if (datosPartos[i] > maxValue) {
      maxValue = datosPartos[i];
      maxIndex = i;
    }
  }
  
  // Encontramos el mes con menos partos
  let minIndex = 0;
  let minValue = datosPartos[0];
  for (let i = 1; i < datosPartos.length; i++) {
    if (datosPartos[i] < minValue) {
      minValue = datosPartos[i];
      minIndex = i;
    }
  }
  
  return (
    <div>
      <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300 border-collapse">
        <thead className="text-xs bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-2 py-1 text-center font-semibold">Mes</th>
            <th className="px-2 py-1 text-center font-semibold">Partos</th>
          </tr>
        </thead>
        <tbody>
          {nombresMeses.map((nombre, index) => (
            <tr key={index}>
              <td className="border-t px-2 py-1 text-center">{nombre}</td>
              <td className="border-t px-2 py-1 text-center font-semibold">{datosPartos[index]}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border-t pt-2 px-2 text-center font-bold">Total</td>
            <td className="border-t pt-2 px-2 text-center font-bold">{total}</td>
          </tr>
        </tfoot>
      </table>
      
      <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
        <div className="text-sm text-center p-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px' }}>
          Mes con <strong>más</strong> partos:<br/>
          <span className="text-lg font-bold">
            {nombresMeses[maxIndex]} ({maxValue} partos)
          </span>
        </div>
        <div className="text-sm text-center p-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
          Mes con <strong>menos</strong> partos:<br/>
          <span className="text-lg font-bold">
            {nombresMeses[minIndex]} ({minValue} partos)
          </span>
        </div>
      </div>
      
      <div className="text-sm text-center mt-3" style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontWeight: 'bold' }}>
        Total: <span className="text-lg">{total} partos</span>
      </div>
      
      <div className="text-xs text-center mt-3 text-gray-500">
        Datos actualizados a: {fecha_actualizacion || 'fecha no disponible'}
      </div>
    </div>
  );
};

export default DistribucionMensualTabla;
