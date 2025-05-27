import os
import sys
import subprocess
import logging

# Configura la ruta para importar módulos del proyecto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Configuración de logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s [%(levelname)8s] %(message)s',
                   datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

def run_psql_command(command):
    """Ejecuta un comando SQL en PostgreSQL utilizando Docker"""
    try:
        # Comando Docker para ejecutar psql en el contenedor
        docker_cmd = [
            'docker', 'exec', 'masclet-db', 
            'psql', '-U', 'postgres', '-d', 'masclet_imperi', 
            '-c', command
        ]
        
        # Ejecutar el comando
        result = subprocess.run(docker_cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"Error ejecutando comando: {result.stderr}")
            return None
        
        return result.stdout
    except Exception as e:
        logger.error(f"Error al ejecutar comando SQL: {str(e)}")
        return None

def check_users():
    """Consulta los usuarios directamente en la base de datos"""
    print("\n=== VERIFICANDO USUARIOS EN LA BASE DE DATOS ===\n")
    
    # Consultar todos los usuarios
    users_query = "SELECT id, username, email, role, is_active FROM users;"
    result = run_psql_command(users_query)
    
    if result:
        print("USUARIOS ENCONTRADOS:")
        print(result)
    else:
        print("No se pudieron obtener los usuarios.")
    
    # Verificar específicamente el usuario Ramon
    ramon_query = "SELECT id, username, email, role, is_active FROM users WHERE username = 'ramon';"
    result = run_psql_command(ramon_query)
    
    if result:
        print("\nDETALLES DE USUARIO RAMON:")
        print(result)
        
        # Verificar si el rol es correcto
        if "Ramon" not in result:
            print("\n⚠️ ADVERTENCIA: El usuario Ramon no tiene el rol correcto 'Ramon'")
            
            # Ofrecer un comando para actualizar el rol
            print("\nPara actualizar el rol, puede ejecutar el siguiente comando:")
            print("docker exec masclet-db psql -U postgres -d masclet_imperi -c \"UPDATE users SET role = 'Ramon' WHERE username = 'ramon';\"")
    else:
        print("\nNo se encontró el usuario 'ramon'")

if __name__ == "__main__":
    check_users()
