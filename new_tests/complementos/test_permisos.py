#!/usr/bin/env python
"""
Script para ejecutar las pruebas de permisos del frontend
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    """Ejecuta las pruebas de permisos del frontend"""
    # Obtiene la ruta base del proyecto
    base_dir = Path(__file__).resolve().parent.parent.parent
    
    # Ruta al script de pruebas
    test_script = base_dir / "new_tests" / "frontend_permisos" / "run_guard_tests.js"
    
    if not test_script.exists():
        print(f"❌ Error: No se encuentra el script de pruebas en {test_script}")
        return 1
    
    print(f"🚀 Ejecutando pruebas de permisos desde {test_script}")
    
    try:
        # Ejecutar el script de Node.js
        result = subprocess.run(
            ["node", str(test_script)],
            check=True,
            cwd=str(base_dir),
            capture_output=True,
            text=True
        )
        
        # Mostrar la salida
        print(result.stdout)
        
        if result.stderr:
            print("⚠️ Advertencias:", file=sys.stderr)
            print(result.stderr, file=sys.stderr)
            
        print("✅ Pruebas de permisos completadas con éxito")
        return 0
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al ejecutar las pruebas: {e}", file=sys.stderr)
        if e.stdout:
            print(e.stdout)
        if e.stderr:
            print(e.stderr, file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
