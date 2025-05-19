import psycopg2
import sys
import locale

def test_connection():
    try:
        print("\nVerificando conexión PostgreSQL...")
        print(f"Sistema encoding: {locale.getpreferredencoding()}")
        print("\nConfiguración:")
        print("- Host: localhost")
        print("- Port: 5432")
        print("- User: postgres")
        print("- Database: postgres")
        
        # Conectar con configuración específica de encoding
        dsn = (
            "host=localhost "
            "port=5432 "
            "dbname=postgres "
            "user=postgres "
            "password=admin123 "
            "client_encoding=WIN1252"
        )
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Verificar versión
        cur.execute('SELECT version()')
        version = cur.fetchone()[0].encode('utf-8').decode('win1252')
        print(f"\n✓ Conexión exitosa!")
        print(f"✓ Versión PostgreSQL: {version}")
        
        # Verificar encodings
        cur.execute('SHOW server_encoding')
        server_encoding = cur.fetchone()[0]
        print(f"✓ Server encoding: {server_encoding}")
        
        cur.execute('SHOW client_encoding')
        client_encoding = cur.fetchone()[0]
        print(f"✓ Client encoding: {client_encoding}")
        
        cur.close()
        conn.close()
        print("\n✓ Test completado con éxito")
        
    except psycopg2.Error as e:
        print(f"\n❌ Error PostgreSQL: {e}")
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"  Detalle: {str(e)}")
        print(f"  Python version: {sys.version}")

if __name__ == "__main__":
    test_connection()