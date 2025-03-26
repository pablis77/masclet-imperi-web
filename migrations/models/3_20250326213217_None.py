from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "animals" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "explotacio" VARCHAR(100) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "genere" VARCHAR(1) NOT NULL,
    "estado" VARCHAR(3) NOT NULL DEFAULT 'OK',
    "alletar" VARCHAR(2) NOT NULL DEFAULT 'NO',
    "dob" DATE,
    "mare" VARCHAR(100),
    "pare" VARCHAR(100),
    "quadra" VARCHAR(50),
    "cod" VARCHAR(20),
    "num_serie" VARCHAR(50),
    "part" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "animals"."genere" IS 'MASCLE: M\nFEMELLA: F';
COMMENT ON COLUMN "animals"."estado" IS 'OK: OK\nDEF: DEF';
COMMENT ON COLUMN "animals"."alletar" IS 'NO_ALLETAR: NO\nUN_TERNERO: 1\nDOS_TERNEROS: 2';
COMMENT ON TABLE "animals" IS 'Modelo de Animal';
CREATE TABLE IF NOT EXISTS "part" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "data" DATE NOT NULL,
    "genere_fill" VARCHAR(1) NOT NULL,
    "estat_fill" VARCHAR(3) NOT NULL DEFAULT 'OK',
    "numero_part" INT NOT NULL,
    "observacions" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "animal_id" INT NOT NULL REFERENCES "animals" ("id") ON DELETE CASCADE
);
COMMENT ON COLUMN "part"."genere_fill" IS 'MASCLE: M\nFEMELLA: F';
COMMENT ON COLUMN "part"."estat_fill" IS 'OK: OK\nDEF: DEF';
COMMENT ON TABLE "part" IS 'Modelo de Parto';
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
COMMENT ON COLUMN "users"."role" IS 'ADMIN: administrador\nGERENTE: gerente\nEDITOR: editor\nUSER: usuario';
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
