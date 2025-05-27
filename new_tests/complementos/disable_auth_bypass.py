"""
Script para desactivar el bypass de autenticación y permitir pruebas de roles reales.
"""
import os
import sys
from pathlib import Path

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(str(Path(__file__).parent.parent.parent))

# Configuración que queremos establecer
BYPASS_MODE = "off"  # Opciones: 'admin', 'ramon', 'off'

def main():
    """Función principal"""
    print(f"Configurando modo de bypass de autenticación: {BYPASS_MODE}")
    
    # Establecer variable de entorno
    os.environ["BYPASS_MODE"] = BYPASS_MODE
    
    # Informar al usuario sobre la configuración
    print(f"Variable de entorno BYPASS_MODE establecida a: {BYPASS_MODE}")
    print("Para que esta configuración tenga efecto, debe reiniciar el servidor de backend.")
    print("\nOpciones de BYPASS_MODE:")
    print("  - 'admin': Todas las peticiones usan el usuario administrador (comportamiento actual)")
    print("  - 'ramon': Todas las peticiones usan el usuario Ramon (para pruebas)")
    print("  - 'off': Desactiva todos los bypasses (usa la autenticación real)")
    
    # Instrucciones para reiniciar el servidor
    print("\nPara reiniciar el servidor, ejecute:")
    print("python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload")
    
    # Instrucciones para verificar el cambio
    print("\nPara verificar que el cambio haya surtido efecto:")
    print("1. Inicie sesión con usuario Ramon")
    print("2. Observe los logs del servidor para verificar que NO aparezca 'BYPASS ACTIVADO'")
    print("3. Verifique que las peticiones se realicen con el usuario real y no con el admin")

if __name__ == "__main__":
    main()
