#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para verificar los contadores de animales en la base de datos.

Este script se conecta a la base de datos y verifica que los contadores de animales
sean consistentes con los datos reales en la base de datos.
"""

import asyncio
from datetime import datetime
from typing import Dict, Tuple, Any

from tortoise import Tortoise, run_async
from tortoise.expressions import Q

from app.models.animal import Animal, EstadoAlletar

# Configuración de la base de datos
DB_CONFIG = {
    'db_url': 'postgres://postgres:postgres@localhost:5432/masclet_imperi',
    'modules': {'models': ['app.models']}
}

class VerificadorContadores:
    """Clase para verificar los contadores de animales en la base de datos."""
    
    def __init__(self):
        self.estadisticas: Dict[str, Any] = {}
        self.errores: list = []
    
    async def inicializar(self):
        """Inicializa la conexión a la base de datos."""
        await Tortoise.init(**DB_CONFIG)
        await Tortoise.generate_schemas()
    
    async def cerrar(self):
        """Cierra la conexión a la base de datos."""
        await Tortoise.close_connections()
    
    async def obtener_estadisticas(self):
        """Obtiene las estadísticas de la base de datos."""
        # Contar animales por género y estado
        self.estadisticas['total_animales'] = await Animal.all().count()
        
        # Animales por género y estado
        self.estadisticas['toros_activos'] = await Animal.filter(genere='M', estado='OK').count()
        self.estadisticas['toros_fallecidos'] = await Animal.filter(genere='M', estado='DEF').count()
        self.estadisticas['vacas_activas'] = await Animal.filter(genere='F', estado='OK').count()
        self.estadisticas['vacas_fallecidas'] = await Animal.filter(genere='F', estado='DEF').count()
        
        # Estados de amamantamiento para vacas activas
        self.estadisticas['vacas_sin_amamantar'] = await Animal.filter(
            genere='F', estado='OK', alletar=EstadoAlletar.NO_ALLETAR
        ).count()
        
        self.estadisticas['vacas_1_ternero'] = await Animal.filter(
            genere='F', estado='OK', alletar=EstadoAlletar.UN_TERNERO
        ).count()
        
        self.estadisticas['vacas_2_terneros'] = await Animal.filter(
            genere='F', estado='OK', alletar=EstadoAlletar.DOS_TERNEROS
        ).count()
        
        # Total de terneros (cada vaca con 1 ternero cuenta como 1, con 2 terneros cuenta como 2)
        self.estadisticas['total_terneros'] = (
            self.estadisticas['vacas_1_ternero'] + 
            (self.estadisticas['vacas_2_terneros'] * 2)
        )
    
    def verificar_consistencia(self):
        """Verifica la consistencia de los datos."""
        # Verificar que la suma de categorías coincide con el total
        suma_categorias = (
            self.estadisticas['toros_activos'] + 
            self.estadisticas['toros_fallecidos'] + 
            self.estadisticas['vacas_activas'] + 
            self.estadisticas['vacas_fallecidas']
        )
        
        if suma_categorias != self.estadisticas['total_animales']:
            self.errores.append(
                f"La suma de categorías ({suma_categorias}) no coincide con el total de animales "
                f"({self.estadisticas['total_animales']})"
            )
        
        # Verificar que la suma de estados de amamantamiento coincide con vacas activas
        suma_estados_vacas = (
            self.estadisticas['vacas_sin_amamantar'] + 
            self.estadisticas['vacas_1_ternero'] + 
            self.estadisticas['vacas_2_terneros']
        )
        
        if suma_estados_vacas != self.estadisticas['vacas_activas']:
            self.estadisticas['vacas_otro_estado'] = (
                self.estadisticas['vacas_activas'] - suma_estados_vacas
            )
            self.errores.append(
                f"La suma de estados de amamantamiento ({suma_estados_vacas}) no coincide con el "
                f"total de vacas activas ({self.estadisticas['vacas_activas']})"
            )
    
    def generar_informe(self):
        """Genera un informe con los resultados de la verificación."""
        # Cabecera
        print("\n" + "="*80)
        print(f"VERIFICACIÓN DE CONTADORES - {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        print("="*80)
        
        # Resumen general
        print("\n=== RESUMEN GENERAL ===")
        print(f"Total de animales: {self.estadisticas['total_animales']}")
        print(f"  • Toros activos: {self.estadisticas['toros_activos']}")
        print(f"  • Toros fallecidos: {self.estadisticas['toros_fallecidos']}")
        print(f"  • Vacas activas: {self.estadisticas['vacas_activas']}")
        print(f"  • Vacas fallecidas: {self.estadisticas['vacas_fallecidas']}")
        
        # Estados de amamantamiento
        print("\n=== ESTADOS DE AMAMANTAMIENTO (VACAS ACTIVAS) ===")
        print(f"  • Sin amamantar (0): {self.estadisticas['vacas_sin_amamantar']}")
        print(f"  • 1 ternero (1): {self.estadisticas['vacas_1_ternero']}")
        print(f"  • 2 terneros (2): {self.estadisticas['vacas_2_terneros']}")
        
        if 'vacas_otro_estado' in self.estadisticas:
            print(f"  • Otro estado: {self.estadisticas['vacas_otro_estado']}")
        
        print(f"\n  • Total de terneros: {self.estadisticas['total_terneros']}")
        
        # Mostrar errores si los hay
        if self.errores:
            print("\n=== ¡ADVERTENCIAS! ===")
            for error in self.errores:
                print(f"  • {error}")
        else:
            print("\n=== VERIFICACIÓN COMPLETADA SIN ERRORES ===")
        
        print("\n" + "="*80 + "\n")

async def main():
    """Función principal."""
    verificador = VerificadorContadores()
    
    try:
        # Inicializar conexión
        await verificador.inicializar()
        
        # Obtener estadísticas
        print("Obteniendo estadísticas de la base de datos...")
        await verificador.obtener_estadisticas()
        
        # Verificar consistencia
        print("Verificando consistencia de los datos...")
        verificador.verificar_consistencia()
        
        # Generar informe
        verificador.generar_informe()
        
    except Exception as e:
        print(f"\n¡ERROR! Ocurrió un error durante la verificación: {str(e)}")
    finally:
        # Cerrar conexión
        await verificador.cerrar()

if __name__ == "__main__":
    run_async(main())
