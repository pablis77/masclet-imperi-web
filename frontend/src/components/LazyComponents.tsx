/**
 * Componentes con lazy loading para mejorar el rendimiento
 * Este archivo centraliza todos los componentes que se cargan de forma diferida
 */
import React, { Suspense } from 'react';
import { lazyLoadComponent } from '../utils/lazyLoad';

// Componente de carga para mostrar mientras se carga el componente real
export const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
           role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Cargando...
        </span>
      </div>
      <p className="mt-2 text-gray-600">Cargando componente...</p>
    </div>
  </div>
);

// Dashboard completo (componente pesado)
const LazyDashboardRaw = lazyLoadComponent(
  () => import('./dashboard/Dashboard'),
  'Dashboard'
);

export const LazyDashboard = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDashboardRaw {...props} />
  </Suspense>
);

// Tablas de animales (componentes pesados con muchos datos)
const LazyAnimalTableRaw = lazyLoadComponent(
  () => import('./animals/AnimalTable'),
  'AnimalTable'
);

export const LazyAnimalTable = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAnimalTableRaw {...props} />
  </Suspense>
);

// Formularios grandes
const LazyAnimalFormRaw = lazyLoadComponent(
  () => import('./animals/AnimalForm'),
  'AnimalForm'
);

export const LazyAnimalForm = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAnimalFormRaw {...props} />
  </Suspense>
);

// Componentes de gráficos (pesados por las bibliotecas)
const LazyPartosChartRaw = lazyLoadComponent(
  () => import('./dashboard/PartosChart'),
  'PartosChart'
);

export const LazyPartosChart = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPartosChartRaw {...props} />
  </Suspense>
);

const LazyGenderDistributionChartRaw = lazyLoadComponent(
  () => import('./dashboard/GenderDistributionChart'),
  'GenderDistributionChart'
);

export const LazyGenderDistributionChart = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyGenderDistributionChartRaw {...props} />
  </Suspense>
);

const LazyStatusDistributionChartRaw = lazyLoadComponent(
  () => import('./dashboard/StatusDistributionChart'),
  'StatusDistributionChart'
);

export const LazyStatusDistributionChart = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyStatusDistributionChartRaw {...props} />
  </Suspense>
);

// Secciones del dashboard
const LazyAnimalesAnalisisRaw = lazyLoadComponent(
  () => import('./dashboard/sections/AnimalesAnalisis'),
  'AnimalesAnalisis'
);

export const LazyAnimalesAnalisis = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAnimalesAnalisisRaw {...props} />
  </Suspense>
);

const LazyPartosAnalisisRaw = lazyLoadComponent(
  () => import('./dashboard/sections/PartosAnalisis'),
  'PartosAnalisis'
);

export const LazyPartosAnalisis = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPartosAnalisisRaw {...props} />
  </Suspense>
);

const LazyExplotacionesSectionRaw = lazyLoadComponent(
  () => import('./dashboard/sections/ExplotacionesSection'),
  'ExplotacionesSection'
);

export const LazyExplotacionesSection = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyExplotacionesSectionRaw {...props} />
  </Suspense>
);

// Importación (muy pesado con validaciones complejas)
const LazyImportFormRaw = lazyLoadComponent(
  () => import('./imports/ImportForm'),
  'ImportForm'
);

export const LazyImportForm = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyImportFormRaw {...props} />
  </Suspense>
);
