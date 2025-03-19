import pandas as pd
from typing import Dict, List
from datetime import datetime
import os
import shutil
import logging
from utils.logger import setup_logging
import sys

# Inicializar logging
logging = setup_logging()

class DataManager:
    def __init__(self):
        print("Inicializando DataManager")
        # Determinar si estamos en modo ejecutable o desarrollo
        if getattr(sys, 'frozen', False):
            # Si es ejecutable
            base_path = sys._MEIPASS
        else:
            # Si es desarrollo
            base_path = os.path.dirname(os.path.dirname(__file__))
        
        # Configurar rutas
        self.data_dir = os.path.join(os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else base_path, 'data')
        self.csv_path = os.path.join(self.data_dir, 'matriz_master.csv')
        self.backup_dir = os.path.join(os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else base_path, 'backups')
        
        # Debug prints
        print(f"Data dir: {self.data_dir}")
        print(f"CSV path: {self.csv_path}")
        print(f"Backup dir: {self.backup_dir}")
        
        # Crear directorios si no existen
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.backup_dir, exist_ok=True)
        
        # Si el CSV no existe en data_dir, copiar desde recursos
        if not os.path.exists(self.csv_path):
            try:
                default_csv = os.path.join(base_path, 'data', 'matriz_master.csv')
                if os.path.exists(default_csv):
                    shutil.copy2(default_csv, self.csv_path)
                    print(f"CSV copiado desde: {default_csv}")
            except Exception as e:
                print(f"Error copiando CSV: {e}")

        self.columns = ['Alletar', 'explotació', 'NOM', 'Genere', 'Pare', 'Mare', 'Quadra', 'COD', 'Nº Serie', 'DOB', 'Estado', 'part', 'GenereT', 'EstadoT']
        self.df = None
        self.load_data()

    def load_data(self):
        try:
            logging.info("Intentando cargar datos...")
            if os.path.exists(self.csv_path):
                self.df = pd.read_csv(self.csv_path, 
                                    encoding='latin1',
                                    sep=';',
                                    na_values=[''],
                                    skipinitialspace=True)
                
                if self.df is not None:
                    logging.info(f"Datos cargados. Filas: {len(self.df)}")
                    logging.debug(f"Últimas entradas:\n{self.df.tail(10)}")
                    logging.debug(f"Columnas disponibles: {self.df.columns.tolist()}")
                    logging.debug(f"Última modificación: {datetime.fromtimestamp(os.path.getmtime(self.csv_path))}")
                
        except Exception as e:
            logging.error(f"Error cargando datos: {e}")
            try:
                # Intento secundario con UTF-8
                self.df = pd.read_csv(self.csv_path, 
                                    encoding='utf-8',
                                    sep=';',
                                    na_values=[''])
                logging.info("Datos cargados exitosamente con UTF-8")
            except Exception as e2:
                logging.error(f"Error secundario: {e2}")
                self.df = pd.DataFrame()

    def get_animal_data(self, nom):
        try:
            animal_data = self.df[self.df['NOM'].astype(str).str.strip().str.lower() == str(nom).strip().lower()]
            if animal_data.empty:
                return {}
                
            first_row = animal_data.iloc[0]
            general_info = {
                'Alletar': str(first_row['Alletar']).lower(),
                'explotació': str(first_row['explotació']),
                'NOM': str(first_row['NOM']),
                'Genere': str(first_row['Genere']),
                'Pare': str(first_row['Pare']) if pd.notna(first_row['Pare']) else '#N/A',
                'Mare': str(first_row['Mare']) if pd.notna(first_row['Mare']) else '#N/A',
                'Quadra': str(first_row['Quadra']) if pd.notna(first_row['Quadra']) else '#N/A',
                'COD': str(first_row['COD']) if pd.notna(first_row['COD']) else '#N/A',
                'Nº Serie': str(first_row['Nº Serie']) if pd.notna(first_row['Nº Serie']) else '#N/A',
                'DOB': str(first_row['DOB']) if pd.notna(first_row['DOB']) else '#N/A',
                'Estado': str(first_row['Estado']) if pd.notna(first_row['Estado']) else '#N/A',
                'EstadoT': str(first_row['EstadoT']) if pd.notna(first_row['EstadoT']) else '#N/A'
            }
            
            return {
                'general': general_info,
                'partos': self.get_partos(animal_data)
            }
        except Exception as e:
            print(f"Error procesando datos del animal: {e}")
            return {}

    def get_partos(self, animal_data):
        partos = []
        rows_with_partos = [row for _, row in enumerate(animal_data.iterrows()) if pd.notna(row[1]['part'])]
        
        rows_with_partos.sort(key=lambda x: pd.to_datetime(x[1]['part'], format='%d/%m/%Y', errors='coerce'))
        
        for idx, (_, row_data) in enumerate(rows_with_partos, 1):
            parto = {
                'Part': str(idx),
                'Fecha': str(row_data['part']),
                'GenereT': str(row_data['GenereT']) if pd.notna(row_data['GenereT']) else '#N/A',
                'EstadoT': str(row_data['EstadoT']) if pd.notna(row_data['EstadoT']) else '#N/A'
            }
            partos.append(parto)
    
        return partos

    def get_explotacion_data(self, explotacion: str):
        if self.df is None or self.df.empty:
            return {'animales': [], 'stats': {'machos': 0, 'hembras': 0, 'terneros': 0}}

        try:
            explotacion = str(explotacion).strip()
            explotacion_data = self.df[self.df['explotació'] == explotacion]

            result = []
            for nom in explotacion_data['NOM'].unique():
                animal_records = explotacion_data[explotacion_data['NOM'] == nom]
                first_record = animal_records.iloc[0]
                num_partos = len(animal_records[animal_records['EstadoT'] == 'OK'])

                result.append({
                    'Alletar': str(first_record['Alletar']),
                    'NOM': str(nom),
                    'Genere': str(first_record['Genere']),
                    'COD': str(first_record['COD']) if pd.notna(first_record['COD']) else '#N/A',
                    'DOB': str(first_record['DOB']) if pd.notna(first_record['DOB']) else '#N/A',
                    'Estado': str(first_record['Estado']) if pd.notna(first_record['Estado']) else '#N/A',
                    'num_partos': str(num_partos) if num_partos > 0 else '#N/A'
                })

            machos = len([a for a in result if a['Genere'] == 'M'])
            hembras = len([a for a in result if a['Genere'] == 'F'])
            terneros = sum(int(a['num_partos']) for a in result if a['num_partos'] != '#N/A')

            result = sorted(result, key=lambda x: (
                x['Estado'] == 'DEF',
                x['Genere'] != 'M',
                x['Alletar'].lower() != 'si' if x['Genere'] == 'F' else False
            ))

            return {
                'animales': result,
                'stats': {
                    'machos': machos,
                    'hembras': hembras,
                    'terneros': terneros
                }
            }
        except Exception as e:
            print(f"Error al obtener datos de explotación: {e}")
            return {'animales': [], 'stats': {'machos': 0, 'hembras': 0, 'terneros': 0}}

    def agregar_nueva_ficha(self, nueva_ficha):
        try:
            nueva_fila = pd.DataFrame([nueva_ficha])
            for col in self.df.columns:
                if col not in nueva_fila.columns:
                    nueva_fila[col] = '#N/A'
            nueva_fila = nueva_fila[self.df.columns]
            self.df = pd.concat([self.df, nueva_fila], ignore_index=True)
            self.df.to_csv(self.csv_path, index=False, sep=';', encoding='latin1')
            print(f"Ficha guardada. Total filas: {len(self.df)}")
            return True
        except Exception as e:
            print(f"Error guardando ficha: {e}")
            raise e

    def actualizar_ficha(self, nom, campos_actualizados):
        try:
            logging.info(f"Intentando actualizar ficha de {nom}")
            logging.info(f"Campos a actualizar: {campos_actualizados}")
            
            # Crear backup antes de actualizar
            self.crear_backup()
            
            mascara = self.df['NOM'].str.strip().str.lower() == str(nom).strip().lower()
            if not mascara.any():
                logging.error(f"No se encontró el animal con NOM: {nom}")
                return False
                
            indices = self.df.index[mascara]
            
            if 'part' in campos_actualizados:
                nueva_fila = self.df.loc[indices[0]].copy()
                nueva_fila['part'] = campos_actualizados['part']
                nueva_fila['GenereT'] = campos_actualizados.get('GenereT', '#N/A')
                nueva_fila['EstadoT'] = campos_actualizados.get('EstadoT', '#N/A')
                
                del campos_actualizados['part']
                campos_actualizados.pop('GenereT', None)
                campos_actualizados.pop('EstadoT', None)
                
                self.df = pd.concat([self.df, pd.DataFrame([nueva_fila])], ignore_index=True)
            
            if campos_actualizados:
                for campo, valor in campos_actualizados.items():
                    self.df.loc[indices[0], campo] = valor
            
            self.df.to_csv(self.csv_path, index=False, sep=';', encoding='latin1')
            logging.info("Cambios guardados correctamente")
            
            return True
            
        except Exception as e:
            logging.error(f"Error actualizando ficha: {e}")
            return False

    def crear_backup(self):
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(self.backup_dir, f"matriz_master_backup_{timestamp}.csv")
            
            # Crear backup
            pd.read_csv(self.csv_path, encoding='latin1', sep=';').to_csv(
                backup_file, index=False, encoding='latin1', sep=';'
            )

            # Mantener solo los 4 backups más recientes
            backups = sorted([f for f in os.listdir(self.backup_dir) 
                            if f.startswith('matriz_master_backup_')],
                            reverse=True)
            
            # Eliminar backups antiguos si hay más de 4
            for old_backup in backups[4:]:
                os.remove(os.path.join(self.backup_dir, old_backup))
                print(f"Backup antiguo eliminado: {old_backup}")

            return True
        except Exception as e:
            print(f"Error al crear backup: {e}")
            return False