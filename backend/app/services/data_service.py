from app.models.animal import Animal
from typing import List, Optional
import pandas as pd
from fastapi import UploadFile

class DataService:
    @staticmethod
    async def import_csv(file: UploadFile) -> dict:
        """Versión moderna de la importación masiva"""
        df = pd.read_csv(file.file, sep=';')
        stats = await process_dataframe(df)
        return {
            "imported": stats["total"],
            "updated": stats["updated"],
            "errors": stats["errors"]
        }