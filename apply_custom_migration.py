import asyncio
import asyncpg
from backend.app.core.config import settings

async def apply_migration():
    print("Conectando a la base de datos...")
    conn = await asyncpg.connect(
        database=settings.postgres_db,
        user=settings.postgres_user,
        password=settings.postgres_password,
        host=settings.db_host,
        port=settings.db_port
    )
    
    try:
        print("Creando tabla imports...")
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS "imports" (
            "id" SERIAL PRIMARY KEY,
            "file_name" VARCHAR(255) NOT NULL,
            "file_size" INT NOT NULL,
            "file_type" VARCHAR(50) NOT NULL,
            "description" VARCHAR(255),
            "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
            "result" JSONB DEFAULT '{}',
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "completed_at" TIMESTAMPTZ
        );
        COMMENT ON TABLE "imports" IS 'Historial de importaciones de datos';
        """)
        
        # Registrar la migración en la tabla aerich
        await conn.execute("""
        INSERT INTO aerich (version_num, content, upgrade, downgrade, create_at)
        VALUES (
            '4_20250401232000_create_imports_table',
            '{"models": {"Animal": {"fields": {"id": {"type": "IntField", "pk": true}, "explotacio": {"type": "CharField", "max_length": 100}, "nom": {"type": "CharField", "max_length": 100}, "genere": {"type": "CharEnumField"}, "estado": {"type": "CharEnumField", "default": "OK"}, "alletar": {"type": "CharEnumField", "default": "0"}, "dob": {"type": "DateField", "null": true}, "mare": {"type": "CharField", "max_length": 100, "null": true}, "pare": {"type": "CharField", "max_length": 100, "null": true}, "quadra": {"type": "CharField", "max_length": 50, "null": true}, "cod": {"type": "CharField", "max_length": 20, "null": true}, "num_serie": {"type": "CharField", "max_length": 50, "null": true}, "part": {"type": "CharField", "max_length": 50, "null": true}, "created_at": {"type": "DatetimeField", "auto_now_add": true}, "updated_at": {"type": "DatetimeField", "auto_now": true}}, "app": "models", "table": "animals"}, "Part": {"fields": {"id": {"type": "IntField", "pk": true}, "animal": {"type": "ForeignKeyField", "model_name": "models.Animal", "on_delete": "CASCADE", "related_name": "parts"}, "part": {"type": "DateField"}, "GenereT": {"type": "CharField", "max_length": 1}, "EstadoT": {"type": "CharField", "max_length": 3, "default": "OK"}, "numero_part": {"type": "IntField", "default": 1}, "created_at": {"type": "DatetimeField", "auto_now_add": true}, "updated_at": {"type": "DatetimeField", "auto_now": true}, "observacions": {"type": "TextField", "null": true}}, "app": "models", "table": "part"}, "Import": {"fields": {"id": {"type": "IntField", "pk": true}, "file_name": {"type": "CharField", "max_length": 255}, "file_size": {"type": "IntField"}, "file_type": {"type": "CharField", "max_length": 50}, "description": {"type": "CharField", "max_length": 255, "null": true}, "status": {"type": "CharEnumField", "default": "PENDING"}, "result": {"type": "JSONField", "default": {}}, "created_at": {"type": "DatetimeField", "auto_now_add": true}, "updated_at": {"type": "DatetimeField", "auto_now": true}, "completed_at": {"type": "DatetimeField", "null": true}}, "app": "models", "table": "imports"}}}',
            'CREATE TABLE IF NOT EXISTS "imports" (
                "id" SERIAL PRIMARY KEY,
                "file_name" VARCHAR(255) NOT NULL,
                "file_size" INT NOT NULL,
                "file_type" VARCHAR(50) NOT NULL,
                "description" VARCHAR(255),
                "status" VARCHAR(20) NOT NULL DEFAULT ''PENDING'',
                "result" JSONB DEFAULT ''{}''::jsonb,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "completed_at" TIMESTAMPTZ
            );',
            'DROP TABLE IF EXISTS "imports";',
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (version_num) DO NOTHING;
        """)
        
        print("Migración aplicada correctamente.")
    except Exception as e:
        print(f"Error al aplicar la migración: {e}")
    finally:
        await conn.close()
        print("Conexión cerrada.")

asyncio.run(apply_migration())
