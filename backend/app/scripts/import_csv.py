import asyncio
import pandas as pd
from tortoise import Tortoise
from app.core.config import TORTOISE_ORM
from app.models import Animal, Part
from datetime import datetime

async def import_csv():
    await Tortoise.init(
        db_url=TORTOISE_ORM["connections"]["default"],
        modules={"models": TORTOISE_ORM["apps"]["models"]["models"]}
    )
    
    await Animal.all().delete()
    
    try:
        # Leer CSV con máxima flexibilidad
        df = pd.read_csv(
            '../docs/base_masclet/matriz_master.csv', 
            sep=';',
            encoding='latin1',
            dtype=str,  # Todo como string para máxima flexibilidad
            na_values=['', 'NA', 'null', 'NULL', 'NaN'],  # Valores nulos flexibles
            keep_default_na=True
        )
        
        print("=== Importando datos ===")
        print(f"Registros en CSV: {len(df)}")
        
        # Mantener registro de códigos procesados
        processed_codes = set()
        
        for _, row in df.iterrows():
            try:
                # Limpieza y validación flexible de datos
                animal_data = {
                    'explotacio': str(row.get('explotació', '')).strip(),
                    'nom': str(row.get('NOM', '')).strip(),
                    'genere': str(row.get('Genere', 'F')).strip().upper()[:1],  # Solo primer carácter
                    'estado': 'OK',
                    'alletar': None if pd.isna(row.get('Alletar')) else str(row['Alletar']).lower() == 'si',
                }

                # Campos opcionales con manejo flexible
                cod = row.get('COD')
                if cod and cod in processed_codes:
                    print(f"⚠️ Código duplicado para {row.get('NOM')}: {cod} - Continuando...")
                    continue
                
                optional_fields = {
                    'pare': row.get('Pare'),
                    'mare': row.get('Mare'),
                    'quadra': row.get('Quadra'),
                    'cod': cod,
                    'num_serie': row.get('Nº Serie', row.get('N° Serie', row.get('N Serie'))),  # Múltiples variantes
                    'dob': None
                }

                # Procesar fecha solo si existe y es válida
                try:
                    if pd.notna(row.get('DOB')):
                        optional_fields['dob'] = datetime.strptime(str(row['DOB']).strip(), '%d/%m/%Y').date()
                except (ValueError, TypeError):
                    print(f"Advertencia: Fecha inválida para {row['NOM']}: {row.get('DOB')}")

                # Añadir campos opcionales solo si tienen valor
                animal_data.update({k: v for k, v in optional_fields.items() if pd.notna(v)})

                if cod:
                    processed_codes.add(cod)
                    
                # Crear animal
                animal = await Animal.create(**animal_data)
                print(f"✅ Importado animal: {animal.nom}")

            except Exception as e:
                print(f"❌ Error importando {row.get('NOM', 'sin nombre')}: {str(e)}")
                continue
            
    except Exception as e:
        print(f"Error general durante la importación: {e}")
    
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(import_csv())