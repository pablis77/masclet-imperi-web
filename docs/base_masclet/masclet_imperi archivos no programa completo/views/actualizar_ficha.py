import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
from PIL import Image, ImageTk
from models.data_manager import DataManager
import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.units import inch
import os
from tkinter import filedialog
import datetime

from utils.message_system import MessageSystem
from config.settings import APP_NAME, WINDOW_SIZE  # Para las constantes APP_NAME y WINDOW_SIZE

import logging
from utils.logger import setup_logging

from image_resources import get_base64_images
from PIL import Image, ImageTk
import io
import base64

# Inicializar logging
logging = setup_logging()

class ActualizarFicha:
    
    def __init__(self, main_app):
        #self.root = root
        
        self.main_app = main_app
        self.main_frame = main_app.main_frame
        self.data_manager = DataManager()
        self.campos_entrada = {}
        
        # Limpiar la ventana principal
        for widget in self.main_frame.winfo_children():
            widget.destroy()
                
        self.crear_interfaz_inicial()
                     
        # Configurar el main_frame correctamente desde el inicio
        #self.main_frame = ttk.Frame(root)
        #self.main_frame.pack(side='top', expand=True, fill='both')
        
        # Inicializar message_system
        #self.message_system = MessageSystem(self.main_frame)
        
        # Configuración inicial de la ventana
        #self.root.title(APP_NAME)
        #self.root.geometry(WINDOW_SIZE)
        #self.root.resizable(True, True)
        #self.root.minsize(800, 600)
        
        # Configuración de grid principal
        #self.root.grid_rowconfigure(0, weight=1)
        #self.root.grid_columnconfigure(0, weight=1)
    
    def _load_logo(self):
        """Carga el logo desde base64"""
        base64_images = get_base64_images()
        image_data = base64.b64decode(base64_images['logo'])
        image = Image.open(io.BytesIO(image_data))
        image = image.resize((200, 100), Image.Resampling.LANCZOS)
        self.logo_photo = ImageTk.PhotoImage(image)
        
    def _draw_border(self, event):
        self.canvas.delete('border')
        w, h = event.width - 4, event.height - 4
        self.canvas.create_rectangle(
            2, 2, w + 2, h + 2,
            outline=self.color,
            width=2,
            tags='border'
        )
    
    
    #def __init__(self, main_app):
        #self.main_app = main_app
        #self.main_frame = main_app.main_frame
        #self.data_manager = DataManager()
        #self.campos_entrada = {}  # Para almacenar los widgets de entrada
        
        #self.limpiar_ventana()
        #self.crear_interfaz_inicial()
        
    def limpiar_ventana(self):
        # Destruir todos los widgets en el main_frame
        for widget in self.main_frame.winfo_children():
            widget.destroy()
        
    def crear_boton_volver(self):
        tk.Button(self.main_frame, text="Tornar", 
                  command=self.main_app.crear_interfaz_principal,
                  font=('Arial', 11), relief='solid', bd=1, bg='white').pack(pady=20, side='bottom')

    def crear_scroll(self, parent):
        canvas = tk.Canvas(parent)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.pack(side="left", fill="both", expand=True)

        # Solo mostrar la barra de scroll si es necesario
        canvas.update_idletasks()
        if canvas.winfo_height() < scrollable_frame.winfo_reqheight():
            scrollbar.pack(side="right", fill="y")
            canvas.configure(yscrollcommand=scrollbar.set)

        return scrollable_frame

    def limpiar_content_frame(self):
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def crear_header(self):
        header_frame = ttk.Frame(self.main_frame)
        header_frame.pack(fill='x', pady=(20,30))
        
        try:
            base64_images = get_base64_images()
            image_data = base64.b64decode(base64_images['logo'])
            image = Image.open(io.BytesIO(image_data))
            image = image.resize((200, 100), Image.Resampling.LANCZOS)
            self.logo_photo = ImageTk.PhotoImage(image)
            logo_label = ttk.Label(header_frame, image=self.logo_photo, background='white')
            logo_label.pack()
        except Exception as e:
            print(f"Error en carregar el logo: {e}")
    
    def crear_interfaz_inicial(self):
        # Forzar que el main_frame comience desde la coordenada (0,0)
        self.main_frame.place(x=0, y=0, relwidth=1, relheight=1)
        
        # Configuración del grid
        self.main_frame.grid_rowconfigure(0, weight=0)  # Header
        self.main_frame.grid_rowconfigure(1, weight=0)  # Search
        self.main_frame.grid_rowconfigure(2, weight=1)  # Content
        self.main_frame.grid_rowconfigure(3, weight=0)  # Messages
        self.main_frame.grid_rowconfigure(4, weight=0)  # Buttons
        self.main_frame.grid_columnconfigure(0, weight=1)

        # Header con logo
        header_frame = ttk.Frame(self.main_frame)
        header_frame.grid(row=0, column=0, sticky='ew', pady=(0,20))
        
        try:
            base64_images = get_base64_images()
            image_data = base64.b64decode(base64_images['logo'])
            image = Image.open(io.BytesIO(image_data))
            image = image.resize((200, 100), Image.Resampling.LANCZOS)
            self.logo_photo = ImageTk.PhotoImage(image)
            logo_label = ttk.Label(header_frame, image=self.logo_photo, background='white')
            logo_label.pack()  # Esto está bien porque es dentro de header_frame
        except Exception as e:
            print(f"Error en carregar el logo: {e}")

        # Frame de búsqueda
        search_frame = ttk.Frame(self.main_frame)
        search_frame.grid(row=1, column=0, sticky='ew', pady=10)
        
        # Centrar elementos de búsqueda
        search_frame.grid_columnconfigure(0, weight=1)
        search_frame.grid_columnconfigure(2, weight=1)
        
        search_content = ttk.Frame(search_frame)
        search_content.grid(row=0, column=1)
        
        ttk.Label(search_content, text="NOM:").grid(row=0, column=0, padx=5)
        self.search_entry = ttk.Entry(search_content)
        self.search_entry.grid(row=0, column=1, padx=5)
        self.search_entry.bind('<Return>', self.buscar_animal)
        ttk.Button(search_content, text="Cercar", command=self.buscar_animal).grid(row=0, column=2, padx=5)

        # Content frame
        self.content_frame = ttk.Frame(self.main_frame)
        self.content_frame.grid(row=2, column=0, sticky='nsew')

        # Frame para mensajes
        message_frame = ttk.Frame(self.main_frame)
        message_frame.grid(row=3, column=0, sticky='ew', pady=10)

        # Botón volver
        tk.Button(self.main_frame, 
                text="Tornar",
                font=('Arial', 11),
                relief='solid',
                bd=1,
                bg='white',
                command=self.main_app.crear_interfaz_principal).grid(row=4, column=0, pady=20)
    
    def buscar_animal(self, event=None):
        nom = self.search_entry.get()
        animal_data = self.data_manager.get_animal_data(nom)
        if animal_data:
            self.mostrar_datos_animal(animal_data)
        else:
            self.main_app.message_system.show_message(f"No s'ha trobat cap animal amb NOM: {nom}", message_type='info')

    def mostrar_datos_animal(self, data):
        self.limpiar_content_frame()
        
    def mostrar_datos_animal(self, data):
        self.limpiar_content_frame()
        
        # Títulos fijos alineados con sus columnas usando grid
        titles_frame = ttk.Frame(self.content_frame)
        titles_frame.pack(fill='x', padx=40)
        
        # Configurar columnas con ancho uniforme
        titles_frame.grid_columnconfigure(0, minsize=200)
        titles_frame.grid_columnconfigure(2, minsize=200)
        
        # Títulos usando grid para alineación precisa
        ttk.Label(titles_frame, text="Dades existents", foreground="#8DC63F", font=('Arial', 11, 'bold')).grid(row=0, column=0, sticky='w')
        ttk.Label(titles_frame, text="Dades noves", foreground="#8DC63F", font=('Arial', 11, 'bold')).grid(row=0, column=1, sticky='w')

        # Frame principal
        ficha_frame = ttk.Frame(self.content_frame)
        ficha_frame.pack(fill='both', expand=True, padx=40, pady=10)
        ficha_frame.grid_columnconfigure(0, weight=2)
        ficha_frame.grid_columnconfigure(1, weight=1)

        # Configuración del scroll container
        scroll_container = ttk.Frame(ficha_frame)
        scroll_container.grid(row=0, column=0, sticky='nsew')
        scroll_container.grid_propagate(False)

        # Canvas con fondo blanco
        canvas = tk.Canvas(scroll_container, width=200, height=500, background='white')
        scrollbar = ttk.Scrollbar(scroll_container, orient="vertical", command=canvas.yview)
        
        scroll_content = ttk.Frame(canvas)
        style = ttk.Style()
        style.configure('White.TFrame', background='white')
        scroll_content.configure(style='White.TFrame')
        scroll_content.grid_columnconfigure(0, weight=1)
        scroll_content.grid_columnconfigure(1, weight=1)

        # Datos existentes y nuevos alineados usando grid con fondo blanco
        datos_existentes = ttk.Frame(scroll_content, style='White.TFrame')
        datos_nuevos = ttk.Frame(scroll_content, style='White.TFrame')
        
        # Configurar el estilo para los frames
        style = ttk.Style()
        style.configure('White.TFrame', background='white')
        
        datos_existentes.grid(row=0, column=0, sticky='nsew', padx=(0,10))
        datos_nuevos.grid(row=0, column=1, sticky='nsew', padx=(10,0))
        
        self.crear_seccion_datos(datos_existentes, data, True)
        self.crear_seccion_datos(datos_nuevos, data, False)

        # Configuración del scroll
        canvas.create_window((0,0), window=scroll_content, anchor='nw')
        scroll_content.bind('<Configure>', lambda e: canvas.configure(scrollregion=canvas.bbox('all')))
        canvas.bind_all("<MouseWheel>", lambda e: canvas.yview_scroll(-1*(e.delta//120), "units"))
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

        # Cambios habituales
        es_hembra = data['general']['Genere'].upper() == 'F'
        self.crear_seccion_cambios_habituales(ficha_frame, es_hembra).grid(row=0, column=1, sticky='n', padx=(20,0))
        
        # Botón DESAR
        tk.Button(self.content_frame, 
                text="DESAR Canvis",
                font=('Arial', 12, 'bold'),
                relief='solid',
                bd=1,
                bg='white',
                width=20,
                height=2,
                command=self.guardar_cambios).pack(pady=20)
    
    def crear_interfaz(self):
        self.crear_header()
        
        content_frame = ttk.Frame(self.main_frame)
        content_frame.pack(expand=True, fill='both', padx=20, pady=10)

        # Barra de búsqueda
        search_frame = ttk.Frame(content_frame)
        search_frame.pack(fill='x', pady=10)
        ttk.Label(search_frame, text="NOM:").pack(side='left')
        self.search_entry = ttk.Entry(search_frame)
        self.search_entry.pack(side='left', padx=5)
        ttk.Button(search_frame, text="Cerca", command=self.buscar_animal).pack(side='left')

        # Frame principal para los datos
        data_frame = ttk.Frame(content_frame)
        data_frame.pack(fill='both', expand=True)

        # Datos existentes
        existing_frame = self.crear_seccion_datos(data_frame, "Dades existents", True)
        existing_frame.grid(row=0, column=0, padx=10, pady=10, sticky='nsew')

        # Datos nuevos
        new_frame = self.crear_seccion_datos(data_frame, "Dades noves", False)
        new_frame.grid(row=0, column=1, padx=10, pady=10, sticky='nsew')

        # Cambios habituales
        changes_frame = ttk.LabelFrame(data_frame, text="Canvis habituals")
        changes_frame.grid(row=0, column=2, padx=10, pady=10, sticky='nsew')

        ttk.Label(changes_frame, text="Estat:").grid(row=0, column=0, sticky='w')
        self.estado_var = tk.StringVar()
        ttk.Combobox(changes_frame, textvariable=self.estado_var, values=['OK', 'DEF']).grid(row=0, column=1)

        ttk.Label(changes_frame, text="Nou Part (femelles)").grid(row=1, column=0, columnspan=2, pady=(10,0))
        ttk.Label(changes_frame, text="Part:").grid(row=2, column=0, sticky='w')
        self.part_entry = ttk.Entry(changes_frame)
        self.part_entry.grid(row=2, column=1)

        ttk.Label(changes_frame, text="GenereT:").grid(row=3, column=0, sticky='w')
        self.generet_var = tk.StringVar()
        ttk.Combobox(changes_frame, textvariable=self.generet_var, values=['M', 'F']).grid(row=3, column=1)

        ttk.Label(changes_frame, text="EstatT:").grid(row=4, column=0, sticky='w')
        self.estadot_var = tk.StringVar()
        ttk.Combobox(changes_frame, textvariable=self.estadot_var, values=['OK', 'DEF']).grid(row=4, column=1)

        # Botón volver
        tk.Button(self.main_frame, text="Tornar", font=('Arial', 11), relief='solid', bd=1, bg='white',
                command=self.main_app.crear_interfaz_principal).pack(pady=20, side='bottom')

    def crear_seccion_datos(self, frame, data, solo_lectura):
        # Headers
        row = 0
        campos = ['NOM', 'explotació', 'Genere', 'Pare', 'Mare', 'Quadra', 'COD', 'Nº Serie', 'DOB']
        
        # Asegurar que las filas tienen la misma altura
        frame.grid_rowconfigure(tuple(range(len(campos) + 10)), uniform='row')
        
        # Campos principales
        for i, campo in enumerate(campos):
            ttk.Label(frame, text=f"{campo}:").grid(row=i, column=0, sticky='w', padx=5, pady=5)
            if solo_lectura:
                ttk.Label(frame, text=data['general'].get(campo, '')).grid(row=i, column=1, sticky='w', padx=5, pady=5)
            else:
                entry_widget = ttk.Combobox(frame, values=['M', 'F']) if campo == 'Genere' else ttk.Entry(frame)
                entry_widget.grid(row=i, column=1, sticky='ew', padx=5, pady=5)
                if not isinstance(entry_widget, ttk.Combobox):
                    entry_widget.insert(0, data['general'].get(campo, ''))
                self.campos_entrada[campo] = entry_widget

        # Sección partos
        if data['partos']:
            row = len(campos) + 1
            for i, parto in enumerate(data['partos']):
                ttk.Label(frame, text=f"Part {parto['Part']}", font=('Arial', 10, 'bold')).grid(row=row, column=0, columnspan=2, sticky='w', padx=5, pady=10)
                row += 1
                
                campos_parto = [('Data', 'Fecha'), ('GenereT', 'GenereT'), ('EstadoT', 'EstadoT')]
                for campo, key in campos_parto:
                    ttk.Label(frame, text=f"{campo}:").grid(row=row, column=0, sticky='w', padx=5, pady=5)
                    if solo_lectura:
                        ttk.Label(frame, text=parto.get(key, '')).grid(row=row, column=1, sticky='w', padx=5, pady=5)
                    else:
                        if campo in ['GenereT', 'EstadoT']:
                            values = ['M', 'F', 'Esforrada'] if campo == 'GenereT' else ['OK', 'DEF']
                            combo = ttk.Combobox(frame, values=values)
                            combo.set(parto.get(key, ''))
                            combo.grid(row=row, column=1, sticky='ew', padx=5, pady=5)
                        else:
                            entry = ttk.Entry(frame)
                            entry.insert(0, parto.get(key, ''))
                            entry.grid(row=row, column=1, sticky='ew', padx=5, pady=5)
                    row += 1
    
    def crear_seccion_cambios_habituales(self, parent, es_hembra):
        """Crea la sección de cambios habituales con borde verde"""
        # Color verde lima del logo
        lima_color = "#8DC63F"
        
        # Configurar estilo para el frame
        style = ttk.Style()
        style.configure('GreenBorder.TLabelframe', 
                    background='white',
                    borderwidth=2,
                    bordercolor=lima_color)
        style.configure('GreenBorder.TLabelframe.Label', 
                    background='white',
                    foreground=lima_color,
                    font=('Arial', 11, 'bold'))

        # Crear frame con el nuevo estilo
        frame = ttk.LabelFrame(parent, text="CANVIS HABITUALS", style='GreenBorder.TLabelframe')

        ttk.Label(frame, text="Estat:", background='white').grid(row=0, column=0, sticky='w', padx=5, pady=2)
        self.estado_var = tk.StringVar()
        ttk.Combobox(frame, textvariable=self.estado_var, values=['OK', 'DEF']).grid(row=0, column=1, padx=5, pady=2)

        ttk.Label(frame, text="Alletar:", background='white').grid(row=1, column=0, sticky='w', padx=5, pady=2)
        self.alletar_var = tk.StringVar()
        alletar_frame = ttk.Frame(frame, style='TFrame')
        alletar_frame.grid(row=1, column=1, sticky='w')
        
        # Usar grid para los radio buttons también
        ttk.Radiobutton(alletar_frame, text="Sí", variable=self.alletar_var, value="si").grid(row=0, column=0)
        ttk.Radiobutton(alletar_frame, text="No", variable=self.alletar_var, value="no").grid(row=0, column=1, padx=(5,0))

        if es_hembra:
            ttk.Label(frame, text="Nou Part:", font=('Arial', 11, 'bold'), background='white').grid(
                row=2, column=0, columnspan=2, pady=(10,5), sticky='w')

            ttk.Label(frame, text="Part:", background='white').grid(row=3, column=0, sticky='w', padx=5, pady=2)
            self.part_entry = ttk.Entry(frame)
            self.part_entry.grid(row=3, column=1, padx=5, pady=2)

            ttk.Label(frame, text="GenereT:", background='white').grid(row=4, column=0, sticky='w', padx=5, pady=2)
            self.generet_var = tk.StringVar()
            ttk.Combobox(frame, textvariable=self.generet_var, values=['M', 'F', 'Esforrada']).grid(row=4, column=1, padx=5, pady=2)

            ttk.Label(frame, text="EstatT:", background='white').grid(row=5, column=0, sticky='w', padx=5, pady=2)
            self.estadot_var = tk.StringVar()
            ttk.Combobox(frame, textvariable=self.estadot_var, values=['OK', 'DEF']).grid(row=5, column=1, padx=5, pady=2)

        return frame
    
    def guardar_cambios(self):
        """Guarda los campos modificados"""
        try:
            nom = self.search_entry.get()
            campos_actualizados = {}
            
            # Obtener datos actuales del animal
            data_actual = self.data_manager.get_animal_data(nom)
            
            # Recopilar cambios de los campos de entrada
            for campo, widget in self.campos_entrada.items():
                valor = widget.get().strip()
                if valor and valor != data_actual['general'].get(campo, ''):
                    campos_actualizados[campo] = valor
            
            # Cambios habituales
            if hasattr(self, 'estado_var') and self.estado_var.get():
                campos_actualizados['Estado'] = self.estado_var.get()
                
            if hasattr(self, 'alletar_var') and self.alletar_var.get():
                campos_actualizados['Alletar'] = self.alletar_var.get().lower()
                
            if hasattr(self, 'generet_var') and self.generet_var.get():
                if self.part_entry.get():
                    campos_actualizados['part'] = self.part_entry.get()
                if self.generet_var.get():
                    campos_actualizados['GenereT'] = self.generet_var.get()
                if hasattr(self, 'estadot_var') and self.estadot_var.get():
                    campos_actualizados['EstadoT'] = self.estadot_var.get()
                    
            logging.info(f"Intentando actualizar campos: {campos_actualizados}")
            
            if campos_actualizados:
                if self.data_manager.actualizar_ficha(nom, campos_actualizados):
                    self.main_app.message_system.show_message(
                        "Fitxa actualitzada correctament",
                        message_type='success'
                    )
                    # Primero limpiamos
                    self.search_entry.delete(0, 'end')
                    # Y luego limpiamos el contenido sin hacer nueva búsqueda
                    self.limpiar_content_frame()
                else:
                    self.main_app.message_system.show_message(
                        "Error en actualitzar la fitxa",
                        message_type='error'
                    )
                    
        except Exception as e:
            self.main_app.message_system.show_message(
                f"Error en guardar canvis: {str(e)}", 
                message_type='error'
            )
        
    
    
    