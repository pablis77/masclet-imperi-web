import React, { useState, useEffect } from 'react';
import { getExplotacions, getAnimalsByExplotacion } from '../services/explotacioService';
import { Button, Card, Input } from './ui';

const Explotaciones: React.FC = () => {
  const [explotaciones, setExplotaciones] = useState([]);
  const [selectedExplotacion, setSelectedExplotacion] = useState<number | null>(null);
  const [animals, setAnimals] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchExplotaciones = async () => {
      const data = await getExplotacions();
      setExplotaciones(data);
    };
    fetchExplotaciones();
  }, []);

  const handleSearch = async () => {
    if (selectedExplotacion) {
      const data = await getAnimalsByExplotacion(selectedExplotacion);
      setAnimals(data);
    }
  };

  const calculateTerneros = (vacas: any[]) => {
    return vacas.reduce((total, vaca) => {
      if (vaca.alletar === 1) return total + 1;
      if (vaca.alletar === 2) return total + 2;
      return total;
    }, 0);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Explotaciones</h1>

      {/* Barra de búsqueda */}
      <div className="flex items-center mb-4">
        <Input
          placeholder="Buscar explotación..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mr-2"
        />
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      {/* Resumen de explotaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {explotaciones.map((explotacion) => (
          <Card key={explotacion.id}>
            <h2 className="text-lg font-bold">{explotacion.nombre}</h2>
            <p>Total animales: {explotacion.totalAnimales}</p>
            <p>Toros: {explotacion.toros}</p>
            <p>Vacas: {explotacion.vacas}</p>
            <p>Terneros: {calculateTerneros(explotacion.vacas)}</p>
          </Card>
        ))}
      </div>

      {/* Listado de animales */}
      {selectedExplotacion && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Animales en la explotación</h2>
          <ul>
            {animals.map((animal) => (
              <li key={animal.id}>{animal.nombre}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón de exportar */}
      <div className="mt-4">
        <Button onClick={() => console.log('Exportar datos')}>Exportar</Button>
      </div>
    </div>
  );
};

export default Explotaciones;