import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from PIL import Image, ImageTk
import os
import pandas as pd
from models.data_manager import DataManager
import shutil
from datetime import datetime
import logging
from image_resources import get_base64_images
import io
import base64
import sys

class ImportarDatosMasivos:
    def __init__(self, main_app):
        self.main_app = main_app
        self.main_frame = main_app.main_frame
        self.data_manager = DataManager()
        
        # Limpiar la ventana principal
        for widget in self.main_frame.winfo_children():
            widget.destroy()
            
        self.setup_interface()

    def setup_interface(self):
        """Configura la interfaz principal"""
        # Forzar que el main_frame comience desde (0,0)
        self.main_frame.place(x=0, y=0, relwidth=1, relheight=1)
        
        # Configuración del grid
        self.main_frame.grid_rowconfigure(0, weight=0)  # Logo
        self.main_frame.grid_rowconfigure(1, weight=0)  # Título
        self.main_frame.grid_rowconfigure(2, weight=0)  # Botón CSV
        self.main_frame.grid_rowconfigure(3, weight=1)  # Preview
        self.main_frame.grid_rowconfigure(4, weight=0)  # Botón volver
        self.main_frame.grid_columnconfigure(0, weight=1)

        # Logo en la parte superior
        try:
            base64_images = get_base64_images()
            image_data = base64.b64decode(base64_images['logo'])
            image = Image.open(io.BytesIO(image_data))
            image = image.resize((200, 100), Image.Resampling.LANCZOS)
            self.logo_photo = ImageTk.PhotoImage(image)
            logo_label = ttk.Label(self.main_frame, image=self.logo_photo, background='white')
            logo_label.grid(row=0, column=0, pady=(20,20))
        except Exception as e:
            logging.error(f"Error al cargar el logo: {e}")

        # Título
        ttk.Label(self.main_frame, 
                text="Importar Dades Massives",
                font=('Arial', 14, 'bold')).grid(row=1, column=0, pady=(0,20))
        
        # Botón CSV
        ttk.Button(self.main_frame,
                text="Seleccionar fitxer CSV",
                command=self.seleccionar_archivo_csv).grid(row=2, column=0, pady=(0,40))
        
        # Frame para la vista previa
        self.preview_frame = ttk.Frame(self.main_frame)
        self.preview_frame.grid(row=3, column=0, sticky='nsew', pady=10)
        
        # Botón volver
        tk.Button(self.main_frame, 
                text="Tornar",
                font=('Arial', 11),
                relief='solid',
                bd=1,
                bg='white',
                command=self.main_app.crear_interfaz_principal).grid(row=4, column=0, pady=20)

    def seleccionar_archivo_csv(self):
        """Permite seleccionar un archivo CSV y muestra su vista previa"""
        # Definimos los nombres de columnas que queremos usar
        NUESTRAS_COLUMNAS = [
            'Alletar', 'explotació', 'NOM', 'Genere', 'Pare', 'Mare', 
            'Quadra', 'COD', 'Nº Serie', 'DOB', 'Estado', 'part', 
            'GenereT', 'EstadoT'
        ]

        filename = filedialog.askopenfilename(
            title="Seleccionar fitxer CSV",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if filename:
            try:
                self.crear_backup()
                self.current_filename = filename
                
                # Leer datos sin usar la primera fila como encabezados
                new_data = pd.read_csv(filename, 
                                    encoding='iso-8859-1', 
                                    sep=';', 
                                    na_filter=False,
                                    header=None,  # No usar primera fila como encabezados
                                    skiprows=1)   # Saltar primera fila
                
                # Asignar nuestros nombres de columnas
                new_data.columns = NUESTRAS_COLUMNAS
                
                current_data = pd.read_csv(self.data_manager.csv_path, 
                                        encoding='iso-8859-1', 
                                        sep=';', 
                                        na_filter=False)
                
                # Limpiar vista previa
                for widget in self.preview_frame.winfo_children():
                    widget.destroy()
                
                # Información del archivo
                info_frame = ttk.LabelFrame(self.preview_frame, text="Informació del fitxer")
                info_frame.pack(fill='x', pady=10)
                
                ttk.Label(info_frame, text=f"Fitxer: {os.path.basename(filename)}").pack(anchor='w')
                ttk.Label(info_frame, text=f"Registres nous: {len(new_data)}").pack(anchor='w')
                ttk.Label(info_frame, text=f"Registres actuals: {len(current_data)}").pack(anchor='w')
                
                # Tabla de vista previa
                table_frame = ttk.Frame(self.preview_frame)
                table_frame.pack(fill='both', expand=True, pady=10)
                
                # Treeview con scrollbars
                tree = ttk.Treeview(table_frame, columns=NUESTRAS_COLUMNAS, show='headings')
                
                vsb = ttk.Scrollbar(table_frame, orient="vertical", command=tree.yview)
                hsb = ttk.Scrollbar(table_frame, orient="horizontal", command=tree.xview)
                tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
                
                # Configurar columnas
                for col in NUESTRAS_COLUMNAS:
                    tree.heading(col, text=col)
                    tree.column(col, width=100)
                
                # Añadir datos
                for idx, row in new_data.iterrows():
                    tree.insert('', 'end', values=list(row))
                
                # Grid con scrollbars
                tree.grid(column=0, row=0, sticky='nsew')
                vsb.grid(column=1, row=0, sticky='ns')
                hsb.grid(column=0, row=1, sticky='ew')
                
                table_frame.grid_columnconfigure(0, weight=1)
                table_frame.grid_rowconfigure(0, weight=1)
                
                # Botón importar
                ttk.Button(self.preview_frame, 
                        text="Importar",
                        command=self.importar_datos).pack(pady=10)
                
            except Exception as e:
                self.mostrar_mensaje(f"Error al leer el archivo: {str(e)}", 'error')

    def crear_backup(self):
        """Crea una copia de seguridad del archivo actual"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Usar las rutas del data_manager
            backup_file = os.path.join(self.data_manager.backup_dir, f"matriz_master_backup_{timestamp}.csv")
            
            # Verificar que el archivo original existe
            if os.path.exists(self.data_manager.csv_path):
                shutil.copy2(self.data_manager.csv_path, backup_file)
                self.mostrar_mensaje(f"Backup creat: {os.path.basename(backup_file)}", 'info')
                return True
            else:
                raise Exception("No se encuentra el archivo CSV original")
                
        except Exception as e:
            error_msg = f"Error al crear backup: {str(e)}"
            self.mostrar_mensaje(error_msg, 'error')
            raise Exception(error_msg)

    def importar_datos(self):
        """Realiza la importación final de los datos"""
        try:
            if hasattr(self, 'current_filename'):
                # Crear backup antes de importar
                self.crear_backup()
                
                # Definimos los nombres de las columnas que queremos usar
                NUESTRAS_COLUMNAS = [
                    'Alletar', 'explotació', 'NOM', 'Genere', 'Pare', 'Mare', 
                    'Quadra', 'COD', 'Nº Serie', 'DOB', 'Estado', 'part', 
                    'GenereT', 'EstadoT'
                ]
                
                # Leer el archivo nuevo sin usar la primera fila como encabezados
                new_data = pd.read_csv(self.current_filename, 
                                    encoding='iso-8859-1', 
                                    sep=';', 
                                    na_filter=False,
                                    header=None,
                                    skiprows=1)
                
                # Asignar nuestros nombres de columnas
                new_data.columns = NUESTRAS_COLUMNAS
                
                # Leer datos actuales usando la ruta del data_manager
                current_data = pd.read_csv(self.data_manager.csv_path, 
                                    encoding='iso-8859-1', 
                                    sep=';', 
                                    na_filter=False)
                
                # Concatenar datos
                combined_data = pd.concat([current_data, new_data], ignore_index=True)
                
                # Guardar resultado usando la ruta del data_manager
                combined_data.to_csv(self.data_manager.csv_path, index=False, encoding='iso-8859-1', sep=';')
                
                # Mostrar mensaje de éxito
                self.mostrar_mensaje(
                    f"Dades importades correctament. Registres afegits: {len(new_data)}. Total registres: {len(combined_data)}",
                    'success'
                )
                
                # Volver a la interfaz principal después de un breve retraso
                self.main_frame.after(2000, self.main_app.crear_interfaz_principal)
                
            else:
                self.mostrar_mensaje("No s'ha seleccionat cap fitxer", 'error')
                
        except Exception as e:
            self.mostrar_mensaje(f"Error en importar dades: {str(e)}", 'error')

    def mostrar_mensaje(self, mensaje, tipo='info'):
        """Muestra mensajes en la interfaz usando el message_system"""
        self.main_app.message_system.show_message(
            mensaje,
            message_type=tipo,
            duration=5000
        )