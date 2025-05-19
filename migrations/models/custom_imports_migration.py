from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
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
        COMMENT ON COLUMN "imports"."id" IS 'Identificador único';
        COMMENT ON COLUMN "imports"."file_name" IS 'Nombre del archivo importado';
        COMMENT ON COLUMN "imports"."file_size" IS 'Tamaño del archivo en bytes';
        COMMENT ON COLUMN "imports"."file_type" IS 'Tipo de archivo (csv, excel, etc.)';
        COMMENT ON COLUMN "imports"."description" IS 'Descripción opcional';
        COMMENT ON COLUMN "imports"."status" IS 'Estado de la importación (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)';
        COMMENT ON COLUMN "imports"."result" IS 'Resultado de la importación en formato JSON con totales y errores';
        COMMENT ON COLUMN "imports"."created_at" IS 'Fecha de creación';
        COMMENT ON COLUMN "imports"."updated_at" IS 'Fecha de última actualización';
        COMMENT ON COLUMN "imports"."completed_at" IS 'Fecha de finalización';
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "imports";
    """
