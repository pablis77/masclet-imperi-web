    def crear_interfaz_inicial(self):
        # Primero asegurarnos de que todo se empaquete desde arriba
        self.main_frame.pack_configure(expand=True, fill='both')
        
        # Logo y header siempre en la parte superior
        header_frame = ttk.Frame(self.main_frame)
        header_frame.pack(side='top', fill='x', pady=(0,20))
        
        
        # Header con logo (forzar que esté arriba)
        #header_frame = ttk.Frame(self.main_frame)
        #header_frame.pack(side='top', fill='x', pady=(20,30))  # Añadido side='top'
        
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

        # Frame de búsqueda justo debajo del logo
        search_frame = ttk.Frame(self.main_frame)
        search_frame.pack(side='top', pady=10)
            
        # Frame de búsqueda (también forzar que esté arriba)
        #search_frame = ttk.Frame(self.main_frame)
        #search_frame.pack(side='top', pady=20)  # Añadido side='top'
        
        ttk.Label(search_frame, text="NOM:").pack(side='left')
        self.search_entry = ttk.Entry(search_frame)
        self.search_entry.pack(side='left', padx=5)
        self.search_entry.bind('<Return>', self.buscar_animal)
        
        ttk.Button(search_frame, text="Cercar", command=self.buscar_animal).pack(side='left')

        # Content frame
        self.content_frame = ttk.Frame(self.main_frame)
        self.content_frame.pack(expand=True, fill='both')

        # Botón volver (siempre al final)
        tk.Button(self.main_frame, 
                text="Tornar",
                font=('Arial', 11),
                relief='solid',
                bd=1,
                bg='white',
                command=self.main_app.crear_interfaz_principal).pack(side='bottom', pady=20)