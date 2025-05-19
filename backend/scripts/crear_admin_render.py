"""
Script sencillo para crear solo el usuario administrador en la base de datos de Render
"""
import psycopg2
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Configuración de conexión a Render
DB_PARAMS = {
    "host": "dpg-d0g7igs9c44c73fbc5d0-a.frankfurt-postgres.render.com",
    "port": "5432",
    "dbname": "masclet_imperi",
    "user": "masclet_imperi_user",
    "password": "61Se3P3wDUXdPmb8KneScy1Gw2hHs8KH"
}

def create_superuser(conn):
    """Crear usuario administrador"""
    admin_username = "admin"
    admin_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # hash de 'admin123'
    
    try:
        with conn.cursor() as cur:
            # Verificar si ya existe el usuario
            cur.execute("SELECT id FROM users WHERE username = %s", (admin_username,))
            if cur.fetchone():
                logger.info(f"Usuario {admin_username} ya existe")
                return True
                
            # Crear usuario administrador
            cur.execute("""
                INSERT INTO users (username, email, hashed_password, is_active, is_superuser, role, full_name, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                admin_username, 
                "admin@example.com", 
                admin_password,
                True,
                True,
                "administrador",
                "Administrador"
            ))
            conn.commit()
            logger.info(f"Usuario administrador {admin_username} creado correctamente")
            return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Error al crear superusuario: {str(e)}")
        return False

def main():
    """Función principal"""
    logger.info("Intentando crear usuario administrador en la base de datos de Render...")
    
    try:
        # Conectar a la base de datos
        logger.info(f"Conectando a: {DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']} como {DB_PARAMS['user']}")
        conn = psycopg2.connect(**DB_PARAMS)
        
        # Crear superusuario
        if create_superuser(conn):
            logger.info("Superusuario creado correctamente")
        else:
            logger.error("No se pudo crear el superusuario")
        
        # Cerrar conexión
        conn.close()
        logger.info("Conexión cerrada")
        
    except Exception as e:
        logger.error(f"Error en el proceso: {str(e)}")
        return 1
        
    return 0

if __name__ == "__main__":
    exit_code = main()
    print(f"Proceso completado con código de salida: {exit_code}")
