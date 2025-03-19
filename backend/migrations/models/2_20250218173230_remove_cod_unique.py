from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP INDEX IF EXISTS "uid_animals_cod_1d5e09";
        ALTER TABLE "animals" ALTER COLUMN "estado" SET DEFAULT 'OK';
        ALTER TABLE "animals" ALTER COLUMN "explotacio" TYPE VARCHAR(255) USING "explotacio"::VARCHAR(255);
        ALTER TABLE "animals" ALTER COLUMN "nom" TYPE VARCHAR(255) USING "nom"::VARCHAR(255);
        ALTER TABLE "parts" ALTER COLUMN "genere_fill" DROP DEFAULT;
        ALTER TABLE "parts" ALTER COLUMN "data" SET NOT NULL;
        CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "username" VARCHAR(50) NOT NULL UNIQUE,
    "password_hash" VARCHAR(128) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "role" VARCHAR(13) NOT NULL DEFAULT 'usuario',
    "is_active" BOOL NOT NULL DEFAULT True,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "users"."role" IS 'ADMIN: administrador\nGERENTE: gerente\nEDITOR: editor\nUSER: usuario';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "parts" ALTER COLUMN "genere_fill" SET DEFAULT 'F';
        ALTER TABLE "parts" ALTER COLUMN "data" DROP NOT NULL;
        ALTER TABLE "animals" ALTER COLUMN "estado" DROP DEFAULT;
        ALTER TABLE "animals" ALTER COLUMN "explotacio" TYPE VARCHAR(100) USING "explotacio"::VARCHAR(100);
        ALTER TABLE "animals" ALTER COLUMN "nom" TYPE VARCHAR(50) USING "nom"::VARCHAR(50);
        DROP TABLE IF EXISTS "users";
        CREATE UNIQUE INDEX "uid_animals_cod_1d5e09" ON "animals" ("cod");"""
