from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    """
    Actualiza el campo alletar de boolean a character varying para soportar los tres estados posibles.
    """
    return """
    -- Primero, convertir los valores booleanos actuales a los valores de la enumeración
    UPDATE animals SET alletar = CASE WHEN alletar = TRUE THEN '1' ELSE 'NO' END;
    
    -- Luego, cambiar el tipo de columna de boolean a character varying
    ALTER TABLE animals ALTER COLUMN alletar TYPE character varying(2) USING alletar::character varying;
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    """
    Revierte el campo alletar de character varying a boolean.
    """
    return """
    -- Convertir de vuelta a boolean
    UPDATE animals SET alletar = CASE WHEN alletar IN ('1', '2') THEN TRUE ELSE FALSE END;
    
    -- Cambiar el tipo de columna de character varying a boolean
    ALTER TABLE animals ALTER COLUMN alletar TYPE boolean USING alletar::boolean;
    """
