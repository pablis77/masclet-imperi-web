import pandas as pd
from typing import List, Optional
from .models import Animal, AnimalCreate, AnimalUpdate
from datetime import datetime
import os

class DataManager:
    def __init__(self):
        self.file_path = "data/matriz_master.csv"
        if not os.path.exists(self.file_path):
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
            # Crear DataFrame con columnas en el orden correcto
            self.df = pd.DataFrame(columns=[
                'Alletar', 'explotació', 'NOM', 'Genere', 'Pare', 
                'Mare', 'Quadra', 'COD', 'Nº Serie', 'DOB', 
                'Estado', 'part', 'GenereT', 'EstadoT'
            ])
            self.df.to_csv(self.file_path, index=False)
        else:
            self.df = pd.read_csv(self.file_path)
            # Convertir fechas
            for col in ['DOB', 'part']:
                if col in self.df.columns:
                    self.df[col] = pd.to_datetime(self.df[col], 
                                                format='%d/%m/%Y', 
                                                errors='coerce').dt.date
        
    def _create_backup(self):
        """Create a backup of the current data"""
        backup_dir = "backups"
        os.makedirs(backup_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{backup_dir}/matriz_master_backup_{timestamp}.csv"
        self.df.to_csv(backup_path, index=False)

    def get_all_animals(self) -> List[Animal]:
        """Get all animals from the database"""
        return [Animal(**row.to_dict()) for _, row in self.df.iterrows()]

    def get_animal(self, cod: str) -> Optional[Animal]:
        """Get a specific animal by its code"""
        animal_data = self.df[self.df['COD'] == cod]
        if animal_data.empty:
            return None
        return Animal(**animal_data.iloc[0].to_dict())

    def create_animal(self, animal: AnimalCreate) -> Animal:
        """Create a new animal record"""
        self._create_backup()
        animal_dict = animal.dict()
        # Asegurar el orden correcto de las columnas
        new_data = pd.DataFrame([{
            'Alletar': None,
            'explotació': animal_dict['explotació'],
            'NOM': animal_dict['NOM'],
            'Genere': animal_dict['Genere'],
            'Pare': animal_dict.get('Pare'),
            'Mare': animal_dict.get('Mare'),
            'Quadra': animal_dict.get('Quadra'),
            'COD': animal_dict['COD'],
            'Nº Serie': animal_dict.get('Nº Serie'),
            'DOB': animal_dict.get('DOB'),
            'Estado': animal_dict['Estado'],
            'part': None,
            'GenereT': None,
            'EstadoT': None
        }])
        self.df = pd.concat([self.df, new_data], ignore_index=True)
        self.df.to_csv(self.file_path, index=False)
        return Animal(**new_data.iloc[0].to_dict())

    def update_animal(self, cod: str, animal: AnimalUpdate) -> Optional[Animal]:
        """Update an existing animal record"""
        self._create_backup()
        mask = self.df['COD'] == cod
        if not any(mask):
            return None
        
        update_dict = {k: v for k, v in animal.dict().items() if v is not None}
        for key, value in update_dict.items():
            self.df.loc[mask, key] = value
        
        self.df.to_csv(self.file_path, index=False)
        return self.get_animal(cod)

    def get_explotacio_stats(self):
        """Get statistics per exploitation"""
        stats = {}
        for explotacio in self.df['explotació'].unique():
            explotacio_df = self.df[self.df['explotació'] == explotacio]
            stats[explotacio] = {
                'total': len(explotacio_df),
                'by_gender': explotacio_df['Genere'].value_counts().to_dict(),
                'by_status': explotacio_df['Estado'].value_counts().to_dict()
            }
        return stats