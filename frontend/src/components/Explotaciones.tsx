import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import animalService from '../services/animalService';
import type { Animal } from '../services/animalService';
import { Button, Card, Input } from './ui';

// Definición del tipo Explotacion
interface Explotacion {
  id: number;
  explotacio: string;
  animal_count: number;
}

const Explotaciones: React.FC = () => {
  const [explotaciones, setExplotaciones] = useState<Explotacion[]>([]);
  const [selectedExplotacion, setSelectedExplotacion] = useState<string | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchExplotaciones = async () => {
      try {
        const data = await animalService.getExplotacions();
        setExplotaciones(data);
      } catch (error) {
        console.error('Error al obtener explotaciones:', error);
        setExplotaciones([]);
      }
    };
    fetchExplotaciones();
  }, []);

  const handleSearch = async () => {
    if (selectedExplotacion) {
      try {
        const data = await animalService.getAnimalsByExplotacion(selectedExplotacion);
        setAnimals(data);
      } catch (error) {
        console.error('Error al obtener animales:', error);
        setAnimals([]);
      }
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
          name="search"
          placeholder="Buscar explotación..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="mr-2"
        />
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      {/* Resumen de explotaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {explotaciones.map((explotacion: any) => (
          <Card key={explotacion.id}>
            <h2 className="text-lg font-bold">{explotacion.explotacio}</h2>
            <p>Total animales: {explotacion.animal_count || 0}</p>
          </Card>
        ))}
      </div>

      {/* Listado de animales */}
      {selectedExplotacion && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Animales en la explotación</h2>
          <ul>
            {animals.map((animal: any) => (
              <li key={animal.id}>{animal.nom}</li>
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