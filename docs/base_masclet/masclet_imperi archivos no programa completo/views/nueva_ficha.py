import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import os
from models.data_manager import DataManager
from datetime import datetime
from image_resources import get_base64_images
import io
import base64
from utils.message_system import MessageSystem
import logging

class NuevaFicha:
    def __init__(self, main_app):
        self.main_app = main_app
        self.main_frame = main_app.main_frame
        self.data_manager = DataManager()
        # Añadir el sistema de mensajes
        self.message_system = MessageSystem(self.main_frame)
        
        # Variables para los campos del formulario
        self.explotacion_var = tk.StringVar()
        self.nom_var = tk.StringVar()
        self.genero_var = tk.StringVar(value="F")  # F por defecto
        self.cod_var = tk.StringVar()
        self.num_serie_var = tk.StringVar()
        self.pare_var = tk.StringVar()
        self.mare_var = tk.StringVar()
        self.cuadra_var = tk.StringVar()
        self.dob_var = tk.StringVar()
        
        # Limpiar la ventana principal
        for widget in self.main_frame.winfo_children():
            widget.destroy()
        
        self.crear_interfaz()

    def crear_interfaz(self):
        # Forzar que el main_frame comience desde (0,0)
        self.main_frame.place(x=0, y=0, relwidth=1, relheight=1)
        
        # Configuración del grid
        self.main_frame.grid_rowconfigure(0, weight=0)  # Logo
        self.main_frame.grid_rowconfigure(1, weight=0)  # Título
        self.main_frame.grid_rowconfigure(2, weight=1)  # Contenido
        self.main_frame.grid_rowconfigure(3, weight=0)  # Botón volver
        self.main_frame.grid_columnconfigure(0, weight=1)

        # Header con logo
        header_frame = ttk.Frame(self.main_frame)
        header_frame.grid(row=0, column=0, sticky='ew', pady=(20,20))
        
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

        # Título
        ttk.Label(self.main_frame, text="Nova Fitxa", 
                font=('Arial', 14, 'bold')).grid(row=1, column=0, pady=(0,20))
        
        # Frame principal con padding
        main_content = ttk.Frame(self.main_frame, padding="20")
        main_content.grid(row=2, column=0, sticky='nsew', padx=20)
        # Frame para el formulario
        form_frame = ttk.Frame(main_content)
        form_frame.pack(fill='x', pady=10)
        
        # Campos obligatorios (con asterisco rojo)
        campos_obligatorios = [
            ("explotació*", self.explotacion_var),
            ("NOM*", self.nom_var),
            ("COD*", self.cod_var),
            ("Nº Serie*", self.num_serie_var)
        ]
        
        for i, (label, var) in enumerate(campos_obligatorios):
            label_frame = ttk.Frame(form_frame)
            label_frame.pack(fill='x', pady=5)
            
            ttk.Label(label_frame, text=label, 
                    font=('Arial', 11, 'bold')).pack(side='left', padx=(0,10))
            ttk.Entry(label_frame, textvariable=var, width=30).pack(side='left')
        
        # Radio buttons para género
        genero_frame = ttk.Frame(form_frame)
        genero_frame.pack(fill='x', pady=10)
        
        ttk.Label(genero_frame, text="Gènere*:", 
                font=('Arial', 11, 'bold')).pack(side='left', padx=(0,10))
        ttk.Radiobutton(genero_frame, text="Femení", value="F", 
                    variable=self.genero_var).pack(side='left', padx=10)
        ttk.Radiobutton(genero_frame, text="Masculí", value="M", 
                    variable=self.genero_var).pack(side='left', padx=10)
        
        # Campos opcionales
        campos_opcionales = [
            ("Pare", self.pare_var),
            ("Mare", self.mare_var),
            ("Quadra", self.cuadra_var)
        ]
        
        for label, var in campos_opcionales:
            label_frame = ttk.Frame(form_frame)
            label_frame.pack(fill='x', pady=5)
            
            ttk.Label(label_frame, text=label, 
                    font=('Arial', 11)).pack(side='left', padx=(0,10))
            ttk.Entry(label_frame, textvariable=var, width=30).pack(side='left')
        
        # Campo de fecha con formato
        fecha_frame = ttk.Frame(form_frame)
        fecha_frame.pack(fill='x', pady=5)
        
        ttk.Label(fecha_frame, text="Data de naixement", 
                font=('Arial', 11)).pack(side='left', padx=(0,10))
        ttk.Entry(fecha_frame, textvariable=self.dob_var, width=30).pack(side='left')
        ttk.Label(fecha_frame, text="(DD/MM/YYYY)", 
                font=('Arial', 9, 'italic')).pack(side='left', padx=5)
        
        # Nota sobre campos obligatorios
        ttk.Label(form_frame, text="* Camps obligatoris", 
                font=('Arial', 10, 'italic'),
                foreground='black').pack(pady=10)
        
        # Frame para botones
        button_frame = ttk.Frame(main_content)
        button_frame.pack(fill='x', pady=20)
        
        # Botón guardar
        tk.Button(button_frame, 
                text="Desar",
                font=('Arial', 12, 'bold'),  # Aumentado tamaño y añadido bold
                relief='solid',
                bd=1,
                bg='white',
                command=self.guardar_ficha).pack(pady=10, anchor='center')
        #tk.Button(button_frame, text="Desar",
                #font=('Arial', 11),
                #relief='solid',
                #bd=1,
                #bg='white',
                #command=self.guardar_ficha).pack(side='right', padx=5)
        
        # Botón volver
        tk.Button(self.main_frame, 
                text="Tornar",
                font=('Arial', 11),
                relief='solid',
                bd=1,
                bg='white',
                command=self.main_app.crear_interfaz_principal).grid(row=3, column=0, pady=20)

    def guardar_ficha(self):
        """Guarda la nueva ficha en el CSV"""
        if not self.validar_campos():
            return
                
        try:
            nueva_ficha = {
                'Alletar': 'no' if self.genero_var.get() == 'F' else '#N/A',
                'explotació': self.explotacion_var.get().strip(),
                'NOM': self.nom_var.get().strip(),
                'Genere': self.genero_var.get(),
                'Pare': self.pare_var.get().strip() or '#N/A',
                'Mare': self.mare_var.get().strip() or '#N/A',
                'Quadra': self.cuadra_var.get().strip() or '#N/A',
                'COD': self.cod_var.get().strip(),
                'Nº Serie': self.num_serie_var.get().strip(),
                'DOB': self.dob_var.get().strip() or '#N/A',
                'Estado': 'OK',
                'part': '#N/A',
                'GenereT': '#N/A',
                'EstadoT': '#N/A'
            }
            
            self.data_manager.agregar_nueva_ficha(nueva_ficha)
            self.main_app.message_system.show_message("Fitxa creada correctament", message_type='success')
            self.limpiar_campos()  # No volver a la interfaz principal
                
        except Exception as e:
            self.main_app.message_system.show_message(f"Error en desar la fitxa: {str(e)}", message_type='error')
        

    def validar_campos(self):
        """Valida que los campos obligatorios no estén vacíos"""
        campos = {
            'explotació': self.explotacion_var.get().strip(),
            'NOM': self.nom_var.get().strip(),
            'COD': self.cod_var.get().strip(),
            'Nº Serie': self.num_serie_var.get().strip()
        }
        
        for campo, valor in campos.items():
            if not valor:
                self.message_system.show_message(f"El camp {campo} és obligatori", message_type='error')
                return False
                
        # Validar formato de fecha si se ha introducido
        if self.dob_var.get().strip():
            try:
                datetime.strptime(self.dob_var.get().strip(), '%d/%m/%Y')
            except ValueError:
                self.message_system.show_message(
                    "Format de data incorrecte. Utilitzeu DD/MM/YYYY", 
                    message_type='error'
                )
                return False
                
        return True
    
    def limpiar_campos(self):
        """Limpia todos los campos después de guardar"""
        self.explotacion_var.set("")
        self.nom_var.set("")
        self.genero_var.set("F")
        self.cod_var.set("")
        self.num_serie_var.set("")
        self.pare_var.set("")
        self.mare_var.set("")
        self.cuadra_var.set("")
        self.dob_var.set("")