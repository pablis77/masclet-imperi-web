"""
Script para generar claves seguras para el entorno de producción.
Crea un archivo .env.production con claves aleatorias seguras.
"""
import os
import secrets
import string
import sys
from pathlib import Path
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Directorio raíz del proyecto
ROOT_DIR = Path(__file__).parent.parent.parent

def generate_secure_key(length=32):
    """
    Genera una clave aleatoria segura.
    
    Args:
        length: Longitud de la clave (por defecto 32 caracteres)
        
    Returns:
        Clave segura generada aleatoriamente
    """
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_env_file(output_path, env_vars=None):
    """
    Genera un archivo .env con claves seguras.
    
    Args:
        output_path: Ruta del archivo .env a generar
        env_vars: Variables de entorno adicionales
    """
    # Variables por defecto
    env_data = {
        "ENVIRONMENT": "prod",
        "API_KEY": generate_secure_key(32),
        "SECRET_KEY": generate_secure_key(64),
        "POSTGRES_PASSWORD": generate_secure_key(16),
        "TRAEFIK_DASHBOARD_PASSWORD": generate_secure_key(16),
        "ACCESS_TOKEN_EXPIRE_MINUTES": "120",  # 2 horas
        "ENABLE_RATE_LIMIT": "true",
        "RATE_LIMIT_REQUESTS": "100",
        "RATE_LIMIT_WINDOW": "60",
    }
    
    # Añadir variables adicionales
    if env_vars:
        env_data.update(env_vars)
    
    # Crear el directorio si no existe
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Escribir el archivo .env
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Archivo generado automáticamente. NO EDITAR MANUALMENTE.\n")
        f.write("# Contiene claves seguras para el entorno de producción.\n\n")
        
        for key, value in sorted(env_data.items()):
            f.write(f"{key}={value}\n")
    
    return env_data

def main():
    """Función principal"""
    logger.info("Generando claves seguras para producción...")
    
    # Determinar la ruta del archivo .env.production
    output_path = ROOT_DIR / ".env.production"
    
    # Generar el archivo .env
    env_data = generate_env_file(output_path)
    
    logger.info(f"Archivo .env.production creado en: {output_path}")
    logger.info("Variables generadas:")
    for key in sorted(env_data.keys()):
        if any(secret_key in key.lower() for secret_key in ["password", "key", "secret"]):
            logger.info(f"  {key}=******* (valor secreto)")
        else:
            logger.info(f"  {key}={env_data[key]}")
    
    # Recordatorio de seguridad
    logger.info("\n⚠️ IMPORTANTE:")
    logger.info("1. Asegúrate de que .env.production esté en .gitignore")
    logger.info("2. Guarda una copia segura de estas credenciales")
    logger.info("3. No compartas este archivo")
    
    # Crear también un archivo .env.example para referencia
    example_path = ROOT_DIR / ".env.example"
    example_data = {k: "YOUR_VALUE_HERE" for k in env_data.keys()}
    
    with open(example_path, 'w', encoding='utf-8') as f:
        f.write("# Archivo de ejemplo para configuración de entorno.\n")
        f.write("# Copia este archivo a .env y establece tus propios valores.\n\n")
        
        for key, value in sorted(example_data.items()):
            f.write(f"{key}={value}\n")
    
    logger.info(f"Archivo .env.example creado en: {example_path}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
