import tkinter as tk
from tkinter import ttk, messagebox, filedialog  # Añadido filedialog
from config.settings import APP_NAME, WINDOW_SIZE, UI_STYLES
from models.auth_service import AuthService
from models.data_manager import DataManager
from views.ui_manager import UIManager
from views.consulta_ficha import ConsultaFicha
import hashlib
from datetime import datetime
import os
import pandas as pd
import shutil
from PIL import Image, ImageTk
import json

from PIL import Image, ImageTk

from utils.message_system import MessageSystem

from image_resources import get_base64_images
import io
import base64

from views.importar_datos_masivos import ImportarDatosMasivos

from utils.paths import PathManager

#from themes.custom_theme import CustomTheme
from ttkthemes import ThemedTk


import logging
from cryptography.fernet import Fernet
from config.settings import ROLES

import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import shutil  # Para la función de backup
from views.consulta_ficha import ConsultaFicha

# Importar módulos de funcionalidad
try:
    from views.consulta_ficha import ConsultaFicha
except ImportError:
    class ConsultaFicha:
        def __init__(self, parent):
            tk.messagebox.showerror("Error", "Módulo de consulta no disponible")

try:
    from views.actualizar_ficha import ActualizarFicha
except ImportError:
    class ActualizarFicha:
        def __init__(self, parent):
            tk.messagebox.showerror("Error", "Módulo de actualización no disponible")

try:
    from views.nueva_ficha import NuevaFicha
except ImportError:
    class NuevaFicha:
        def __init__(self, parent):
            tk.messagebox.showerror("Error", "Módulo de nueva ficha no disponible")

try:
    from views.gestionar_usuarios import GestionUsuarios
except ImportError:
    class GestionUsuarios:
        def __init__(self, parent):
            tk.messagebox.showerror("Error", "Módulo de gestión de usuarios no disponible")

class MascletImperiApp:
    def __init__(self, root, encryption_key=None):
        self.root = root
        self.main_frame = ttk.Frame(root)
        self.main_frame.pack(side='top', expand=True, fill='both')
        
        # Configuración inicial de la ventana
        self.root.title(APP_NAME)
        
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        min_width = 400
        min_height = 900

        initial_width = max(min_width, int(screen_width * 0.2))
        initial_height = max(min_height, int(screen_height * 0.7))

        x = (screen_width - initial_width) // 2
        y = (screen_height - initial_height) // 2

        self.root.geometry(f"{initial_width}x{initial_height}+{x}+{y}")
        self.root.minsize(min_width, min_height)
        
        # Inicializar ui_manager antes de usarlo
        self.ui_manager = UIManager()
        
        # Message system
        self.message_system = MessageSystem(self.main_frame)
    
    # El resto del código del __init__ se mantiene igual...
        
        # Variables para login
        self.username_var = tk.StringVar()
        self.password_var = tk.StringVar()
        self.recordar_var = tk.BooleanVar()

        # Inicializar clave de encriptación
        self.key = encryption_key or Fernet.generate_key()
        self.cipher_suite = Fernet(self.key)

        # Inicializar servicios
        self.auth_service = AuthService(
            username_var=self.username_var,
            password_var=self.password_var,
            recordar_var=self.recordar_var,
            encryption_key=self.key
        )
        self.data_manager = DataManager()

        # Variables de estado
        self.user_role = None
        self.username = None
        self.is_logged_in = False

        # Frame principal
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(expand=True, fill='both')
        
        # Configurar interfaz inicial
        self.crear_interfaz_principal()
        self.actualizar_hora()

        # Inicializar directorios
        self.dirs = PathManager.ensure_directories()
    
        
    def verificar_login(self):
        username = self.username_var.get()
        password = self.password_var.get()
        
        if self.auth_service.verify_credentials(username, password):
            self.username = username
            self.user_role = self.auth_service.usuarios[username]["role"]
            self.is_logged_in = True
            
            if self.recordar_var.get():
                self.auth_service.guardar_credenciales(username, password)
            
            self.crear_interfaz_principal()
        else:
            self.password_var.set("")
            self.mostrar_error_login()  # En lugar de messagebox.showerror
            
    def crear_interfaz_principal(self):
        # Limpiar ventana
        for widget in self.main_frame.winfo_children():
            widget.destroy()
        
        # Header con logo
        header_frame = ttk.Frame(self.main_frame)
        header_frame.pack(fill='x', pady=(40,60))
        
        try:
            base64_images = get_base64_images()
            image_data = base64.b64decode(base64_images['logo'])
            image = Image.open(io.BytesIO(image_data))
            image = image.resize((360, 180), Image.Resampling.LANCZOS)
            self.logo_photo = ImageTk.PhotoImage(image)
            logo_label = ttk.Label(header_frame, image=self.logo_photo, background='white')
            logo_label.pack()
        except Exception as e:
            print(f"Error en carregar el logo: {e}")

        # Content frame para los botones principales
        content_frame = ttk.Frame(self.main_frame)
        content_frame.pack(expand=True)

        if not self.is_logged_in:
            self.crear_form_login(content_frame)
        else:
            self.crear_botones_principales(content_frame)

        # Status frame para la barra inferior
        status_frame = tk.Frame(self.main_frame, bg='white')
        status_frame.pack(side='bottom', fill='x', pady=10, padx=10)

        # Frame para información de usuario y fecha
        info_frame = tk.Frame(status_frame, bg='white')
        info_frame.pack(side='left')

        # Frame para el texto de usuario
        user_info = tk.Label(info_frame, 
                            text=f"Usuari: {self.username} | Rol: {self.user_role}",
                            bg='white',
                            font=('Arial', 11))
        user_info.pack(side='left')

        # Label para la fecha/hora
        self.datetime_label = tk.Label(info_frame, 
                                    text="",
                                    bg='white',
                                    font=('Arial', 11))
        self.datetime_label.pack(side='left', padx=10)

        # Frame central para el botón de importar datos (solo para administrador)
        #if self.is_logged_in and self.user_role == "administrador":
            #import_frame = tk.Frame(status_frame, bg='white')
            #import_frame.pack(side='left', expand=True, fill='x', padx=20)
            
            #import_button = tk.Button(import_frame,
                                    #text="Importar Dades Massives",
                                    #font=('Arial', 11),
                                    #relief='solid',
                                    #bd=1,
                                    #bg='white',
                                    #command=self.importar_datos_masivos)
            #import_button.pack(pady=5)

        # Frame para el botón de cerrar sesión (solo si está logueado)
        if self.is_logged_in:
            logout_frame = tk.Frame(status_frame, bg='white')
            logout_frame.pack(side='right')
            
            tk.Button(logout_frame,
                    text="Tancar Sessió",
                    font=('Arial', 11),
                    relief='solid',
                    bd=1,
                    bg='white',
                    command=self.cerrar_sesion).pack(pady=5)
    
    def cerrar_sesion(self):
        self.is_logged_in = False
        self.user_role = None
        self.username = None
        # No limpiar self._photo_images aquí
        self.crear_interfaz_principal()
        
    def init_encryption_key(self):
        """Inicializa o recupera la clave de encriptación"""
        key_file = PathManager.get_file_path('encryption_key.key', 'config')
        try:
            if os.path.exists(key_file):
                with open(key_file, 'rb') as file:
                    self.key = file.read()
            else:
                self.key = Fernet.generate_key()
                with open(key_file, 'wb') as file:
                    file.write(self.key)
            self.cipher_suite = Fernet(self.key)
        except Exception as e:
            print(f"Error inicializando clave: {e}")
            
    def crear_form_login(self, parent):
        """Crear formulario de login con estilos mejorados"""
        login_frame = ttk.Frame(parent)
        login_frame.pack(expand=True)
        
        # Cargar credenciales guardadas
        if not self.auth_service.cargar_credenciales():
            self.username_var.set("")
            self.password_var.set("")
        
        # Usuario
        ttk.Label(login_frame, 
                text="Usuari:", 
                font=('Arial', 12, 'bold')).pack(pady=5)
        username_entry = ttk.Entry(login_frame, 
                                textvariable=self.username_var,
                                font=('Arial', 12))
        username_entry.pack(pady=5)
        
        # Contraseña
        ttk.Label(login_frame, 
                text="Contrasenya:", 
                font=('Arial', 12, 'bold')).pack(pady=5)
        password_entry = ttk.Entry(login_frame, 
                                textvariable=self.password_var, 
                                show="*",
                                font=('Arial', 12))
        password_entry.pack(pady=5)
        
        # Checkbox recordar
        ttk.Checkbutton(login_frame, 
                       text="Recordar Credencials",
                       variable=self.recordar_var).pack(pady=5)
        
        # Botón login con estilo mejorado
        login_button = self.ui_manager.create_styled_button(
            login_frame,
            text="Iniciar Sessió",
            command=self.verificar_login,
            width=15
        )
        login_button.pack(pady=20)
        
        # Bindings
        username_entry.focus()
        username_entry.bind('<Return>', lambda e: password_entry.focus())
        password_entry.bind('<Return>', lambda e: self.verificar_login())
    
    
    def cargar_credenciales(self):
        """Carga las credenciales guardadas"""
        try:
            credentials_file = PathManager.get_file_path('credentials.dat', 'config')
            if os.path.exists(credentials_file):
                if not hasattr(self, 'cipher_suite'):
                    self.init_encryption_key()
                    
                with open(credentials_file, 'rb') as file:
                    datos_encrypted = file.read()
                    if datos_encrypted:
                        datos_decrypted = self.cipher_suite.decrypt(datos_encrypted)
                        datos = json.loads(datos_decrypted.decode())
                        
                        self.username_var.set(datos['username'])
                        self.password_var.set(datos['password'])
                        self.recordar_var.set(True)
            return False
        except:
            if os.path.exists(credentials_file):
                os.remove(credentials_file)
            return False
    
    def importar_datos_masivos(self):
        """Permite importar un nuevo archivo CSV con datos masivos"""
        try:
            filename = filedialog.askopenfilename(
                title="Seleccionar archivo CSV",
                filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
            )
            
            if filename:
                # Crear una copia de respaldo antes de la importación
                self.crear_backup()
                
                # Mostrar ventana de confirmación con vista previa
                self.mostrar_vista_previa_importacion(filename)
                
        except Exception as e:
            messagebox.showerror("Error", f"Error al importar datos: {str(e)}")

    def crear_backup(self):
        """Crea una copia de seguridad del archivo actual"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = "copias de seguridad"
            
            if not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
                
            backup_file = os.path.join(backup_dir, f"matriz_master_backup_{timestamp}.csv")
            shutil.copy2("matriz_master.csv", backup_file)
            
            print(f"Backup creado: {backup_file}")
            return True
        except Exception as e:
            print(f"Error al crear backup: {e}")
            raise e

    def mostrar_vista_previa_importacion(self, filename):
        """Muestra una ventana con vista previa de los datos a importar"""
        preview_window = tk.Toplevel(self.root)
        preview_window.title("Vista Previa de Importación")
        preview_window.geometry("800x600")
        preview_window.configure(bg='white')
        
        try:
            # Leer el nuevo CSV
            new_data = pd.read_csv(filename, encoding='latin1', sep=';')
            current_data = pd.read_csv('matriz_master.csv', encoding='latin1', sep=';')
            
            # Frame principal
            main_frame = ttk.Frame(preview_window, padding="20")
            main_frame.pack(fill='both', expand=True)
            
            # Información general
            info_text = f"""
            Archivo a importar: {os.path.basename(filename)}
            Registros nuevos: {len(new_data)}
            Registros actuales: {len(current_data)}
            """
            ttk.Label(main_frame, text=info_text, justify='left').pack(pady=10)
            
            # Vista previa de los datos
            preview_frame = ttk.Frame(main_frame)
            preview_frame.pack(fill='both', expand=True)
            
            # Crear Treeview para mostrar los primeros registros
            tree = ttk.Treeview(preview_frame, columns=list(new_data.columns), show='headings')
            
            # Configurar columnas
            for col in new_data.columns:
                tree.heading(col, text=col)
                tree.column(col, width=100)
            
            # Añadir los primeros 10 registros
            for idx, row in new_data.head(10).iterrows():
                tree.insert('', 'end', values=list(row))
                
            # Scrollbars
            vsb = ttk.Scrollbar(preview_frame, orient="vertical", command=tree.yview)
            hsb = ttk.Scrollbar(preview_frame, orient="horizontal", command=tree.xview)
            tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
            
            # Grid
            tree.grid(column=0, row=0, sticky='nsew')
            vsb.grid(column=1, row=0, sticky='ns')
            hsb.grid(column=0, row=1, sticky='ew')
            
            preview_frame.grid_columnconfigure(0, weight=1)
            preview_frame.grid_rowconfigure(0, weight=1)
            
            # Botones
            button_frame = ttk.Frame(main_frame)
            button_frame.pack(fill='x', pady=20)
            
            ttk.Button(button_frame, text="Importar", 
                      command=lambda: self.confirmar_importacion(filename, preview_window)
                      ).pack(side='right', padx=5)
            ttk.Button(button_frame, text="Cancelar", 
                      command=preview_window.destroy
                      ).pack(side='right', padx=5)
            
        except Exception as e:
            messagebox.showerror("Error", f"Error al leer el archivo: {str(e)}")
            preview_window.destroy()

    def confirmar_importacion(self, filename, preview_window):
        """Realiza la importación final de los datos"""
        try:
            # Leer los datos nuevos
            new_data = pd.read_csv(filename, encoding='latin1', sep=';')
            
            # Leer los datos actuales
            current_data = pd.read_csv('matriz_master.csv', encoding='latin1', sep=';')
            
            # Identificar registros duplicados por NOM
            duplicate_noms = set(new_data['NOM']).intersection(set(current_data['NOM']))
            
            if duplicate_noms:
                # Crear un sufijo para los nombres duplicados
                for nom in duplicate_noms:
                    # Encontrar todas las ocurrencias del nombre y añadir un sufijo
                    mask = new_data['NOM'] == nom
                    count = 1
                    for idx in new_data[mask].index:
                        new_data.at[idx, 'NOM'] = f"{nom}_{count}"
                        count += 1
            
            # Concatenar los datos (añadir nuevos al final)
            combined_data = pd.concat([current_data, new_data], ignore_index=True)
            
            # Guardar el resultado
            combined_data.to_csv('matriz_master.csv', index=False, encoding='latin1', sep=';')
            
            self.message_system.show_message(
                f"Dades importades correctament.\nRegistres afegits: {len(new_data)}\nTotal registres: {len(combined_data)}", 
                message_type='success',
                duration=5000
            )

            if duplicate_noms:
                self.message_system.show_message(
                    f"Es van trobar noms duplicats que van ser modificats:\n{', '.join(duplicate_noms)}", 
                    message_type='warning',
                    duration=7000
                )
            
            preview_window.destroy()
            
        except Exception as e:
            messagebox.showerror("Error", f"Error en importar dades: {str(e)}")
        
    def mostrar_error_login(self):
        # Frame para la imagen de error
        error_frame = ttk.Frame(self.main_frame)
        error_frame.place(relx=0.5, rely=0.5, anchor='center')
        
        try:
            # Cargar y mostrar la imagen desde base64
            base64_images = get_base64_images()
            image_data = base64.b64decode(base64_images['no_password'])
            error_image = Image.open(io.BytesIO(image_data))
            error_image = error_image.resize((300, 300), Image.Resampling.LANCZOS)
            self.error_photo = ImageTk.PhotoImage(error_image)
            
            # Añadir el mensaje de error ANTES de la imagen
            tk.Label(error_frame, 
                    text="GUAU!!! GUAU!!!! AQUÍ NO ENTRA SENSE CONTRASENYA",
                    font=('Arial', 14, 'bold'),
                    fg='red',
                    bg='white').pack(pady=(0,20))
            
            # Crear label con la imagen y hacer bind para el click
            error_label = ttk.Label(error_frame, image=self.error_photo, cursor='hand2')
            error_label.pack()
            
            # Bind del click para cerrar la imagen
            error_label.bind('<Button-1>', lambda e: error_frame.destroy())
        
        except Exception as e:
            print(f"Error en carregar la imatge: {e}")
            messagebox.showerror("Error", "Usuari o contrasenya incorrectes")

    def cerrar_sesion(self):
        self.is_logged_in = False
        self.user_role = None
        self.username = None
        self.crear_interfaz_principal()

    def actualizar_hora(self):
        try:
            ahora = datetime.now()
            fecha_hora = ahora.strftime("%H:%M:%S  %d/%m/%Y")
            if hasattr(self, 'datetime_label') and self.datetime_label.winfo_exists():
                self.datetime_label.config(text=fecha_hora)
            self.root.after(1000, self.actualizar_hora)
        except Exception as e:
            print(f"Error al actualizar hora: {e}")

    def consultar_ficha(self):
        """Muestra la interfaz de consulta de ficha en la ventana principal"""
        try:
            ConsultaFicha(self)
        except Exception as e:
            messagebox.showerror("Error", f"Error al abrir interfaz de consulta: {e}")
    
    def actualizar_ficha(self):
        """Muestra la interfaz de actualización de ficha en la ventana principal"""
        try:
            ActualizarFicha(self)
        except Exception as e:
            messagebox.showerror("Error", f"Error al abrir interfaz de actualización: {e}")
    
    def nueva_ficha(self):
        try:
            if hasattr(self, 'main_frame'):
                NuevaFicha(self)
            else:
                messagebox.showerror("Error", "Error de inicialización")
        except Exception as e:
            messagebox.showerror("Error", f"Error al abrir ventana de nueva ficha: {e}")
            
    def gestionar_usuarios(self):
        """Abre la ventana de gestión de usuarios"""
        try:
            GestionUsuarios(self)  # Pasamos self (main_app) directamente
        except Exception as e:
            messagebox.showerror("Error", f"Error al abrir ventana de gestión de usuarios: {e}")
    
    def crear_botones_principales(self, parent):
        button_frame = ttk.Frame(parent)
        button_frame.pack(expand=True)

        def create_custom_button(text, command):
            frame = tk.Frame(button_frame, bg='white')
            frame.pack(pady=10)
            btn = tk.Button(frame, text=text, command=command,
                        font=('Arial', 11),
                        relief='solid',
                        bd=1,
                        bg='white',
                        width=30,
                        height=2)
            btn.pack()
            return btn

        # Botones operativos principales
        create_custom_button("Consulteu Fitxa", self.consultar_ficha)
        
        if self.user_role in ["administrador", "editor"]:
            create_custom_button("Actualitzar Fitxa", self.actualizar_ficha)
        
        if self.user_role == "administrador":
            create_custom_button("Nova Fitxa", self.nueva_ficha)
            
            # Espaciador para separar funciones administrativas
            tk.Label(button_frame, text="", bg='white', height=2).pack()
            
            create_custom_button("Gestionar Usuaris", self.gestionar_usuarios)
            create_custom_button("Importar Dades Massives", lambda: ImportarDatosMasivos(self))

        
if __name__ == "__main__":
    try:
        root = ThemedTk(theme="forest", background='white')
                    
        # Configurar el tema
        style = ttk.Style(root)
        style.configure('.', background='white')  # Configuración global
        style.configure('TFrame', background='white')
        style.configure('TLabel', background='white')
        style.configure('TButton', background='white')
                
        app = MascletImperiApp(root)
        root.mainloop()
    except Exception as e:
        logging.error(f"Error iniciant aplicació: {e}")