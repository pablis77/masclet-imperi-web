from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "animals" (
            "id" SERIAL PRIMARY KEY,
            "explotacio" VARCHAR(255) NOT NULL,
            "nom" VARCHAR(255) NOT NULL,
            "genere" VARCHAR(1) NOT NULL,
            "estado" VARCHAR(3) NOT NULL DEFAULT 'OK',
            "alletar" BOOLEAN,
            "pare" VARCHAR(100),
            "mare" VARCHAR(100),
            "quadra" VARCHAR(100),
            "cod" VARCHAR(20),
            "num_serie" VARCHAR(50),
            "dob" DATE,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS "parts" (
            "id" SERIAL PRIMARY KEY,
            "data" DATE NOT NULL,
            "genere_fill" VARCHAR(1) NOT NULL,
            "estat_fill" VARCHAR(3) NOT NULL DEFAULT 'OK',
            "numero_part" INTEGER NOT NULL,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "animal_id" INTEGER NOT NULL REFERENCES "animals" ("id") ON DELETE CASCADE
        );
        CREATE UNIQUE INDEX "idx_part_animal_data" ON "parts" ("animal_id", "data");
    """

async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "parts";
        DROP TABLE IF EXISTS "animals";
    """
