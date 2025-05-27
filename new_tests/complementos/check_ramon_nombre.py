"""
Script simplificado para verificar el nombre de usuario de Ramon directamente en la base de datos.
"""
import psycopg2
import os
import sys
from pprint import pprint

# Configuración de la base de datos (ajustar según configuración en el proyecto)
DB_HOST = "localhost"
DB_PORT = "5433"  # Según vimos en la salida del comando anterior
DB_NAME = "masclet_imperi"
DB_USER = "postgres"
DB_PASS = "1234"

def verificar_usuario_ramon():
    """Comprobar cómo está almacenado el nombre de usuario de Ramon en la base de datos."""
    print("\n🔍 VERIFICACIÓN DE NOMBRE DE USUARIO DE RAMON EN LA BASE DE DATOS 🔍")
    print("="*80)
    
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        
        print(f"✅ Conexión establecida a la base de datos: {DB_NAME}")
        
        # Crear cursor
        cur = conn.cursor()
        
        # Consulta para encontrar usuarios con nombre similar a Ramon (ignorando mayúsculas/minúsculas)
        cur.execute("SELECT id, username, email, role, is_active FROM users WHERE LOWER(username) LIKE '%ramon%'")
        usuarios = cur.fetchall()
        
        if not usuarios:
            print("❌ No se encontró ningún usuario con nombre similar a 'ramon'")
            
            # Veamos todos los usuarios para entender qué hay en la base de datos
            print("\nListando todos los usuarios disponibles:")
            cur.execute("SELECT id, username, email, role FROM users LIMIT 10")
            todos_usuarios = cur.fetchall()
            
            if todos_usuarios:
                for user in todos_usuarios:
                    print(f"ID: {user[0]}, Username: '{user[1]}', Email: {user[2]}, Role: {user[3]}")
            else:
                print("No hay usuarios en la base de datos.")
        else:
            print(f"✅ Se encontraron {len(usuarios)} usuarios con nombre similar a 'ramon':")
            print("-"*80)
            
            for user in usuarios:
                print(f"ID: {user[0]}")
                print(f"Username exacto: '{user[1]}' (tipo: {type(user[1])})")
                print(f"Email: {user[2]}")
                print(f"Role: {user[3]}")
                print(f"Activo: {user[4]}")
                print("-"*80)
        
        # Cerrar cursor y conexión
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {e}")

if __name__ == "__main__":
    verificar_usuario_ramon()
