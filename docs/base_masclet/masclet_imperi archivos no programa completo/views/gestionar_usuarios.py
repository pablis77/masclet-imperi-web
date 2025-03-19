import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
from image_resources import get_base64_images
import io
import base64

import hashlib

class GestionUsuarios:
    def __init__(self, main_app):
        self.main_app = main_app
        self.main_frame = main_app.main_frame
        
        # Limpiar la ventana principal
        for widget in self.main_frame.winfo_children():
            widget.destroy()
            
        self.crear_interfaz()

    def crear_interfaz(self):
        # Header con logo
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

        # Título
        ttk.Label(self.main_frame, 
                text="Gestió d'Usuaris", 
                font=('Arial', 14, 'bold')).pack(pady=(0,20))

        # Frame para añadir usuarios
        add_frame = ttk.LabelFrame(self.main_frame, text="Afegir Usuari", padding="20")
        add_frame.pack(fill='x', padx=20, pady=10)
        
        # Grid para los campos de entrada
        grid_frame = ttk.Frame(add_frame)
        grid_frame.pack(fill='x', padx=5, pady=5)
        
        # Usuario
        ttk.Label(grid_frame, text="Usuari:").grid(row=0, column=0, padx=5, pady=5)
        self.username_var = tk.StringVar()
        ttk.Entry(grid_frame, textvariable=self.username_var).grid(row=0, column=1, padx=5, pady=5)
        
        # Frame para primera contraseña con su botón ver/ocultar
        pwd_frame1 = ttk.Frame(grid_frame)
        pwd_frame1.grid(row=0, column=2, columnspan=2, padx=5, pady=5)
        ttk.Label(pwd_frame1, text="Contrasenya:").pack(side='left')
        self.password_var = tk.StringVar()
        pwd_entry1 = ttk.Entry(pwd_frame1, textvariable=self.password_var, show="*")
        pwd_entry1.pack(side='left', padx=5)
        ttk.Button(pwd_frame1, text="👁", width=3, command=lambda: self.toggle_password_visibility(pwd_entry1)).pack(side='left')

        # Frame para segunda contraseña con su botón ver/ocultar
        pwd_frame2 = ttk.Frame(grid_frame)
        pwd_frame2.grid(row=0, column=4, columnspan=2, padx=5, pady=5)
        ttk.Label(pwd_frame2, text="Repetir:").pack(side='left')
        self.password_var2 = tk.StringVar()
        pwd_entry2 = ttk.Entry(pwd_frame2, textvariable=self.password_var2, show="*")
        pwd_entry2.pack(side='left', padx=5)
        ttk.Button(pwd_frame2, text="👁", width=3, command=lambda: self.toggle_password_visibility(pwd_entry2)).pack(side='left')
        
        # Rol
        ttk.Label(grid_frame, text="Rol:").grid(row=0, column=6, padx=5, pady=5)
        self.role_var = tk.StringVar(value="usuari")
        roles = ttk.Combobox(grid_frame, textvariable=self.role_var, 
                        values=["editor", "usuari"],
                        state="readonly")
        roles.grid(row=0, column=7, padx=5, pady=5)
        
        # Botón añadir
        ttk.Button(grid_frame, text="Afegir Usuari", 
                command=self.add_user).grid(row=0, column=8, padx=5, pady=5)

        # Frame para lista de usuarios
        list_frame = ttk.LabelFrame(self.main_frame, text="Usuaris Existents", padding="20")
        list_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # Treeview para la lista de usuarios
        self.tree = ttk.Treeview(list_frame, columns=("Usuari", "Rol"), show='headings')
        self.tree.heading("Usuari", text="Usuari")
        self.tree.heading("Rol", text="Rol")
        self.tree.pack(fill='both', expand=True, padx=5, pady=5)
        
        # Scrollbar para el Treeview
        scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=self.tree.yview)
        scrollbar.pack(side='right', fill='y')
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Frame para botones de acción
        action_frame = ttk.Frame(self.main_frame)
        action_frame.pack(fill='x', padx=20, pady=10)
        
        ttk.Button(action_frame, text="Eliminar Usuari",
                command=self.delete_user).pack(side='left', padx=5)
        ttk.Button(action_frame, text="Canviar Contrasenya",
                command=self.change_password).pack(side='left', padx=5)

        # Nota informativa
        ttk.Label(self.main_frame, 
                text="Nota: Només pot existir un administrador en el sistema",
                font=('Arial', 9, 'italic')).pack(pady=5)

        # Cargar usuarios existentes
        self.cargar_usuarios_existentes()
        
        # Botón volver
        tk.Button(self.main_frame, 
                text="Tornar",
                font=('Arial', 11),
                relief='solid',
                bd=1,
                bg='white',
                command=self.main_app.crear_interfaz_principal).pack(pady=20, side='bottom')
    
    def toggle_password_visibility(self, entry_widget):
        """Alterna la visibilidad de la contraseña"""
        if entry_widget.cget('show') == '*':
            entry_widget.configure(show='')
        else:
            entry_widget.configure(show='*')
    
    def add_user(self):
        """Añade un nuevo usuario al sistema"""
        # Obtener valores de los campos
        username = self.username_var.get().strip()
        password = self.password_var.get()
        password2 = self.password_var2.get()
        role = self.role_var.get()
        
        # Validaciones
        if not username or not password or not password2:
            self.main_app.message_system.show_message(
                "Tots els camps són obligatoris", 
                message_type='error'
            )
            return
        
        # Verificar que las contraseñas coinciden
        if password != password2:
            self.main_app.message_system.show_message(
                "Les contrasenyes no coincideixen", 
                message_type='error'
            )
            return
        
        # Verificar que el usuario no existe
        if username in self.main_app.auth_service.usuarios:
            self.main_app.message_system.show_message(
                "Aquest usuari ja existeix", 
                message_type='error'
            )
            return

        # Crear nuevo usuario usando auth_service
        self.main_app.auth_service.usuarios[username] = {
            "password": hashlib.sha256(password.encode()).hexdigest(),
            "role": role
        }
        
        # Guardar cambios
        self.main_app.auth_service.save_users()
        
        # Actualizar Treeview
        self.tree.insert('', 'end', values=(username, role))
        
        # Limpiar campos
        self.username_var.set("")
        self.password_var.set("")
        self.password_var2.set("")
        self.role_var.set("usuari")
        
        # Mostrar mensaje de éxito
        self.main_app.message_system.show_message(
            "Usuari creat correctament",
            message_type='success'
        )  
                
    def cargar_usuarios_existentes(self):
        """Carga los usuarios existentes en el Treeview"""
        # Limpiar Treeview
        for item in self.tree.get_children():
            self.tree.delete(item)
            
        # Cargar usuarios desde auth_service
        for username, data in self.main_app.auth_service.usuarios.items():
            self.tree.insert('', 'end', values=(username, data['role']))

    def change_password(self):
        # Verificar que hay un usuario seleccionado
        selection = self.tree.selection()
        if not selection:
            self.main_app.message_system.show_message(
                "Selecciona un usuari primer",
                message_type='error'
            )
            return
        
        # Obtener usuario seleccionado
        usuario = self.tree.item(selection[0])['values'][0]
        
        # Crear ventana de diálogo
        dialog = tk.Toplevel(self.main_frame)
        dialog.title("Canviar Contrasenya")
        dialog.geometry("400x200")
        dialog.resizable(False, False)
        
        # Centrar la ventana
        dialog.transient(self.main_frame)
        dialog.grab_set()
        
        # Variables para las contraseñas
        new_password = tk.StringVar()
        confirm_password = tk.StringVar()
        
        def update_password():
            if not new_password.get() or not confirm_password.get():
                self.main_app.message_system.show_message(
                    "Tots els camps són obligatoris",
                    message_type='error'
                )
                return
                    
            if new_password.get() != confirm_password.get():
                self.main_app.message_system.show_message(
                    "Les contrasenyes no coincideixen",
                    message_type='error'
                )
                return
            
            # Actualizar contraseña usando auth_service
            self.main_app.auth_service.usuarios[usuario]["password"] = hashlib.sha256(new_password.get().encode()).hexdigest()
            self.main_app.auth_service.save_users()
            
            # Mostrar mensaje de éxito
            self.main_app.message_system.show_message(
                "Contrasenya actualitzada correctament",
                message_type='success'
            )
            
            # Cerrar diálogo
            dialog.destroy()

    def delete_user(self):
        # Verificar que hay un usuario seleccionado
        selection = self.tree.selection()
        if not selection:
            self.main_app.message_system.show_message(
                "Selecciona un usuari primer",
                message_type='error'
            )
            return
        
        # Obtener usuario seleccionado
        usuario = self.tree.item(selection[0])['values'][0]
        
        # No permitir eliminar el administrador
        if usuario == "admin":
            self.main_app.message_system.show_message(
                "No es pot eliminar l'administrador del sistema",
                message_type='error'
            )
            return
        
        # Eliminar usuario usando auth_service
        del self.main_app.auth_service.usuarios[usuario]
        self.main_app.auth_service.save_users()
        
        # Eliminar del Treeview
        self.tree.delete(selection[0])
        
        # Mostrar mensaje
        self.main_app.message_system.show_message(
            "Usuari eliminat correctament",
            message_type='success'
        )