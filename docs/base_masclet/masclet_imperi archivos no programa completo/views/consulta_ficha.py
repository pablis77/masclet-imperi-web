
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
from image_resources import get_base64_images
from PIL import Image, ImageTk
import io
import base64

class ConsultaFicha:
    def __init__(self, main_app):
        self.main_app = main_app
        self.main_frame = main_app.main_frame
        self.nom_search_var = tk.StringVar()
        self.exp_search_var = tk.StringVar()
        self.data_manager = DataManager()
        self._load_logo()
        
        # Cargar el icono del toro
        try:
            base64_images = get_base64_images()
            bull_data = base64.b64decode(base64_images['bull'])
            bull_image = Image.open(io.BytesIO(bull_data))
            
            # Forzar modo de color para asegurar que no sea transparente
            if bull_image.mode != 'RGB':
                bull_image = bull_image.convert('RGB')
            
            # Redimensionar manteniendo la proporción
            self.bull_icon_large = ImageTk.PhotoImage(
                bull_image.resize((30, 30), Image.Resampling.LANCZOS))
            self.bull_icon_small = ImageTk.PhotoImage(
                bull_image.resize((15, 15), Image.Resampling.LANCZOS))

        except Exception as e:
            print(f"Error en carregar icona de toro: {str(e)}")
            self.bull_icon_large = None
            self.bull_icon_small = None
            
        # Limpiar el frame principal
        for widget in self.main_frame.winfo_children():
            widget.destroy()
            
        self.crear_interfaz_consulta()
        
    def _load_logo(self):
        """Carga el logo desde base64"""
        base64_images = get_base64_images()
        image_data = base64.b64decode(base64_images['logo'])
        image = Image.open(io.BytesIO(image_data))
        image = image.resize((200, 100), Image.Resampling.LANCZOS)
        self.logo_photo = ImageTk.PhotoImage(image)

    def crear_interfaz_consulta(self):
        # Forzar que el main_frame comience desde (0,0)
        self.main_frame.place(x=0, y=0, relwidth=1, relheight=1)
        
        # Configuración del grid para el layout principal
        self.main_frame.grid_rowconfigure(0, weight=0)  # Header
        self.main_frame.grid_rowconfigure(1, weight=0)  # Search
        self.main_frame.grid_rowconfigure(2, weight=1)  # Results
        self.main_frame.grid_rowconfigure(3, weight=0)  # Button
        self.main_frame.grid_columnconfigure(0, weight=1)

        # Header con logo
        header_frame = ttk.Frame(self.main_frame)
        header_frame.grid(row=0, column=0, sticky='ew', pady=(20,20))
        
        # Logo
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

        # Frame para búsqueda y resultados
        content_frame = ttk.Frame(self.main_frame)
        content_frame.grid(row=1, column=0, sticky='nsew')
        
        # Usar la función existente para crear la barra de búsqueda
        self.crear_barra_busqueda(content_frame)
        
        # Frame para resultados
        self.results_frame = ttk.Frame(content_frame)
        self.results_frame.pack(fill='both', expand=True)
        
        # Botón volver
        tk.Button(self.main_frame, 
                text="Tornar",
                font=('Arial', 11),
                relief='solid',
                bd=1,
                bg='white',
                command=self.main_app.crear_interfaz_principal).grid(row=3, column=0, pady=20)

    def crear_barra_busqueda(self, parent):
        search_frame = ttk.Frame(parent)
        search_frame.pack(fill='x', pady=(0, 20))
        
        # Frame contenedor centrado
        center_frame = ttk.Frame(search_frame)
        center_frame.pack(expand=True, anchor='center')
        
        # Frame para los campos de búsqueda
        search_fields_frame = ttk.Frame(center_frame)
        search_fields_frame.pack(expand=True)
        
        # Búsqueda por NOM
        nom_frame = ttk.Frame(search_fields_frame)
        nom_frame.pack(side='left', padx=(0, 20))
        ttk.Label(nom_frame, text="NOM:", font=('Arial', 11, 'bold')).pack(side='left', padx=(0, 5))
        nom_entry = ttk.Entry(nom_frame, textvariable=self.nom_search_var, width=20)
        nom_entry.pack(side='left')
        
        # Búsqueda por Explotación
        exp_frame = ttk.Frame(search_fields_frame)
        exp_frame.pack(side='left')
        ttk.Label(exp_frame, text="explotació:", font=('Arial', 11, 'bold')).pack(side='left', padx=(0, 5))
        exp_entry = ttk.Entry(exp_frame, textvariable=self.exp_search_var, width=20)
        exp_entry.pack(side='left')
        
        # Frame para el botón centrado
        button_frame = ttk.Frame(search_frame)
        button_frame.pack(fill='x', pady=10)
        
        # Botón de búsqueda
        buscar_btn = tk.Button(button_frame, text="Cercar",
                            font=('Arial', 11),
                            relief='solid',
                            bd=1,
                            bg='white',
                            command=self.realizar_busqueda)
        buscar_btn.pack(expand=True)

        # Binding de Enter para búsqueda
        nom_entry.bind('<Return>', lambda e: self.realizar_busqueda())
        exp_entry.bind('<Return>', lambda e: self.realizar_busqueda())

    def realizar_busqueda(self):
        """Realiza la búsqueda según los criterios ingresados"""
        # Limpiar frame de resultados
        for widget in self.results_frame.winfo_children():
            widget.destroy()
        
        nom = self.nom_search_var.get().strip()
        explotacion = self.exp_search_var.get().strip()
        
        if nom:
            self.mostrar_ficha_individual(nom)
        elif explotacion:
            self.mostrar_lista_explotacion(explotacion)
        
        # Limpiar los campos de búsqueda después de realizar la búsqueda
        self.nom_search_var.set("")
        self.exp_search_var.set("")

    #def crear_header(self):
    #    header_frame = ttk.Frame(self.main_frame)
    #    header_frame.pack(fill='x', pady=(20,30))
        
    #    try:
    #        base64_images = get_base64_images()
    #        image_data = base64.b64decode(base64_images['logo'])
    #        image = Image.open(io.BytesIO(image_data))
     #       image = image.resize((200, 100), Image.Resampling.LANCZOS)
      #      self.logo_photo = ImageTk.PhotoImage(image)
       #     logo_label = ttk.Label(header_frame, image=self.logo_photo, background='white')
        #    logo_label.pack()
        #except Exception as e:
         #   print(f"Error en carregar el logo: {e}")

    def mostrar_ficha_individual(self, nom):
        """Muestra la ficha individual de un animal"""
        # Obtener datos del animal
        data = self.data_manager.get_animal_data(nom.strip())
        
        # Limpiar el frame de resultados anterior
        for widget in self.results_frame.winfo_children():
            widget.destroy()
                
        if not data:
            # Mensaje de ficha no encontrada
            mensaje_frame = ttk.Frame(self.results_frame)
            mensaje_frame.pack(expand=True, fill='both', padx=20, pady=20)
            
            ttk.Label(mensaje_frame, 
                    text=f"FITXA NO TROBADA\nNo se encontraron datos para el NOM: {nom}",
                    font=('Arial', 12, 'bold'),
                    justify='center').pack(expand=True)
            return

        general_info = data['general']
        partos = data['partos']
        
        ficha_frame = ttk.Frame(self.results_frame)
        ficha_frame.pack(fill='both', expand=True, padx=40, pady=20)
        
        # Explotación en la parte superior
        ttk.Label(ficha_frame, text="explotació:", font=('Arial', 11, 'bold')).grid(row=0, column=0, sticky='w', padx=5, pady=5)
        ttk.Label(ficha_frame, text=general_info['explotació']).grid(row=0, column=1, sticky='w', padx=5, pady=5)
        
        # Primera línea con indicador (círculo o toro) y datos principales
        indicator_canvas = tk.Canvas(ficha_frame, width=30, height=30,
                                bg='white', highlightthickness=0)
        indicator_canvas.grid(row=1, column=0, padx=(5,0), pady=5, sticky='e')
        
        # Dibujar según género y Alletar
        indicator_canvas = tk.Canvas(ficha_frame, width=30, height=30,
                                 bg='white', highlightthickness=0)
        indicator_canvas.grid(row=1, column=0, padx=(5,0), pady=5, sticky='e')

        if general_info['Estado'] == 'DEF':
            indicator_canvas.create_line(3, 3, 27, 27, fill='black', width=2)
            indicator_canvas.create_line(3, 27, 27, 3, fill='black', width=2)
        elif general_info['Genere'].upper() == 'M':
            if self.bull_icon_large:
                indicator_label = ttk.Label(ficha_frame, 
                                            image=self.bull_icon_large,
                                            background='white')
                indicator_label.grid(row=1, column=0, padx=(5,0), pady=5, sticky='e')
            else:
                indicator_canvas.create_oval(3, 3, 27, 27,
                                            fill='black', outline="black", width=1)
        else:
            color = "skyblue" if general_info['Alletar'].lower() == 'si' else "white"
            indicator_canvas.create_oval(3, 3, 27, 27,
                                        fill=color, outline="black", width=1)
        
        print(f"Dades danimal: {general_info}")
        
        # Primera fila: NOM y Genere
        ttk.Label(ficha_frame, text="NOM:", font=('Arial', 11, 'bold')).grid(row=1, column=1, sticky='w', padx=(10,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['NOM']).grid(row=1, column=2, sticky='w', padx=5, pady=5)
        ttk.Label(ficha_frame, text="Genere:", font=('Arial', 11, 'bold')).grid(row=1, column=3, sticky='w', padx=(20,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['Genere']).grid(row=1, column=4, sticky='w', padx=5, pady=5)

        # Segunda fila: Pare y Mare
        ttk.Label(ficha_frame, text="Pare:", font=('Arial', 11, 'bold')).grid(row=2, column=1, sticky='w', padx=(10,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['Pare']).grid(row=2, column=2, sticky='w', padx=5, pady=5)
        ttk.Label(ficha_frame, text="Mare:", font=('Arial', 11, 'bold')).grid(row=2, column=3, sticky='w', padx=(20,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['Mare']).grid(row=2, column=4, sticky='w', padx=5, pady=5)

        # Tercera fila: Quadra y COD
        ttk.Label(ficha_frame, text="Quadra:", font=('Arial', 11, 'bold')).grid(row=3, column=1, sticky='w', padx=(10,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['Quadra']).grid(row=3, column=2, sticky='w', padx=5, pady=5)
        ttk.Label(ficha_frame, text="COD:", font=('Arial', 11, 'bold')).grid(row=3, column=3, sticky='w', padx=(20,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['COD']).grid(row=3, column=4, sticky='w', padx=5, pady=5)

        # Cuarta fila: Nº Serie y DOB
        ttk.Label(ficha_frame, text="Nº Serie:", font=('Arial', 11, 'bold')).grid(row=4, column=1, sticky='w', padx=(10,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['Nº Serie']).grid(row=4, column=2, sticky='w', padx=5, pady=5)
        ttk.Label(ficha_frame, text="DOB:", font=('Arial', 11, 'bold')).grid(row=4, column=3, sticky='w', padx=(20,5), pady=5)
        ttk.Label(ficha_frame, text=data['general']['DOB']).grid(row=4, column=4, sticky='w', padx=5, pady=5)

        
        #linea de codigo puesta a capón por el Pablis al final
        ttk.Label(ficha_frame, text="Estat:", font=('Arial', 11, 'bold')).grid(row=3, column=5, sticky='w', padx=(20,5), pady=5)
        ttk.Label(ficha_frame, text=general_info['Estado']).grid(row=3, column=6, sticky='w', padx=5, pady=5)
        
        # Espacio entre la información general y los partos
        ttk.Label(ficha_frame, text="").grid(row=4, column=0, pady=10)
        
        # Mostrar información de partos
        start_row = 5
        for i, parto in enumerate(partos):
            row = start_row + i
            # Número de parto y fecha
            ttk.Label(ficha_frame, text=f"Part {parto['Part']}:", 
                    font=('Arial', 11, 'bold')).grid(row=row, column=1, sticky='w', padx=(10,5), pady=5)
            ttk.Label(ficha_frame, text=parto['Fecha']).grid(row=row, column=2, sticky='w', padx=5, pady=5)
            
            # Género
            ttk.Label(ficha_frame, text="GenereT:", 
                    font=('Arial', 11, 'bold')).grid(row=row, column=3, sticky='w', padx=(20,5), pady=5)
            ttk.Label(ficha_frame, text=parto['GenereT']).grid(row=row, column=4, sticky='w', padx=5, pady=5)
            
            # Estado
            ttk.Label(ficha_frame, text="EstatT:", 
                    font=('Arial', 11, 'bold')).grid(row=row, column=5, sticky='w', padx=(20,5), pady=5)
            ttk.Label(ficha_frame, text=parto['EstadoT']).grid(row=row, column=6, sticky='w', padx=5, pady=5)

    def mostrar_lista_explotacion(self, explotacion):
        """Muestra la lista de animales de una explotación"""
        # Obtener datos
        resultado = self.data_manager.get_explotacion_data(explotacion)
        animales = resultado['animales']
        stats = resultado['stats']
        
        # Limpiar búsquedas anteriores
        self.nom_search_var.set("")
        self.exp_search_var.set("")
        
        # Limpiar el frame de resultados anterior
        for widget in self.results_frame.winfo_children():
            widget.destroy()

        if not animales:
            mensaje_frame = ttk.Frame(self.results_frame)
            mensaje_frame.pack(expand=True, fill='both', padx=20, pady=20)
            ttk.Label(mensaje_frame, 
                    text=f"No s'han trobat animals per a l'explotació: {explotacion}",
                    font=('Arial', 11),
                    justify='center').pack(expand=True)
            return

        # Frame principal
        main_frame = ttk.Frame(self.results_frame)
        main_frame.pack(fill='both', expand=True, padx=20, pady=20)

        # Título
        titulo = f"llista d'explotació: {explotacion} "
        
        # Calcular estadísticas excluyendo los animales con estado DEF
        machos = len([a for a in animales if a['Genere'] == 'M' and a['Estado'] != 'DEF'])
        hembras = len([a for a in animales if a['Genere'] == 'F' and a['Estado'] != 'DEF'])
        terneros = len([a for a in animales if a['Genere'] == 'F' and a['Alletar'] == 'si' and a['Estado'] != 'DEF'])

        estadisticas = f"({machos}/{hembras}/{terneros})"

        ttk.Label(main_frame, text=titulo, font=('Arial', 12, 'bold')).pack(pady=(0,5))
        ttk.Label(main_frame, text=estadisticas, font=('Arial', 16, 'bold')).pack(pady=(0,5))
        
        # Fecha y hora actual
        fecha_hora = datetime.datetime.now().strftime("%H:%M  %d/%m/%Y")
        ttk.Label(main_frame, text=fecha_hora, font=('Arial', 10)).pack(pady=(0,20))

        # Frame para headers (fijo)
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill='x', pady=(0,0))
        headers = ["", "NOM", "COD", "DOB", "Nº Partos"]
        for col, header in enumerate(headers):
            ttk.Label(header_frame, text=header, font=('Arial', 11, 'bold')).grid(row=0, column=col, padx=10, pady=5, sticky='w')

        # Frame con scroll para datos
        canvas = tk.Canvas(main_frame, width=200, height=400, bg='white')
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        # Configurar el scroll
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        # Binding para la rueda del ratón
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        # Empaquetar los elementos del scroll
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Datos en el frame scrollable
        for i, animal in enumerate(animales, 1):
            indicator_canvas = tk.Canvas(scrollable_frame, width=15, height=15,
                                        bg='white', highlightthickness=0)
            indicator_canvas.grid(row=i, column=0, padx=5, pady=2)

            if animal.get('Estado') == 'DEF':
                indicator_canvas.delete("all")
                indicator_canvas.create_line(2, 2, 13, 13, fill='black', width=2)
                indicator_canvas.create_line(2, 13, 13, 2, fill='black', width=2)
            elif animal.get('Genere', '').upper() == 'M':
                if self.bull_icon_small:
                    indicator_label = ttk.Label(scrollable_frame,
                                                image=self.bull_icon_small,
                                                background='white')
                    indicator_label.grid(row=i, column=0, padx=5, pady=2)
                else:
                    indicator_canvas.create_oval(2, 2, 13, 13,
                                                fill='black', outline="black", width=1)
            else:
                color = "skyblue" if animal.get('Alletar', '').lower() == 'si' else "white"
                indicator_canvas.create_oval(2, 2, 13, 13, fill=color, outline="black", width=1)
            
            # Ahora los datos del animal en las columnas
            ttk.Label(scrollable_frame, text=animal['NOM']).grid(
                row=i, column=1, padx=10, pady=2, sticky='w')
            ttk.Label(scrollable_frame, text=animal.get('COD', '#N/A')).grid(
                row=i, column=2, padx=10, pady=2, sticky='w')
            ttk.Label(scrollable_frame, text=animal.get('DOB', '#N/A')).grid(
                row=i, column=3, padx=10, pady=2, sticky='w')
            ttk.Label(scrollable_frame, text=animal.get('num_partos', '#N/A')).grid(
                row=i, column=4, padx=10, pady=2, sticky='w')

        # Botón de imprimir
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill='x', pady=10)
        ttk.Button(button_frame, 
                text="Imprimir",
                command=lambda: self.preparar_impresion(explotacion, animales)
                ).pack(side='right', padx=10)
        
        
    def preparar_impresion(self, explotacion, datos):
        """Genera un PDF con el listado de animales"""
        try:
            # Pedir al usuario dónde guardar el archivo
            filename = filedialog.asksaveasfilename(
                defaultextension=".pdf",
                filetypes=[("PDF files", "*.pdf")],
                initialfile=f"Llistat_Explotació_{explotacion}_{datetime.datetime.now().strftime('%Y%m%d')}.pdf"
            )
            
            if not filename:  # Si el usuario cancela la operación
                return
            
            # Crear el documento PDF
            doc = SimpleDocTemplate(
                filename,
                pagesize=A4,
                rightMargin=30,
                leftMargin=30,
                topMargin=30,
                bottomMargin=30
            )
            
            # Estilos
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=30
            )
            
            # Contenido del documento
            elements = []
            
            # Título
            title = Paragraph(f"Llistat d´Animals - Explotació: {explotacion}", title_style)
            elements.append(title)
            
            # Preparar datos para la tabla
            table_data = [['Alletar', 'NOM', 'COD', 'DOB', 'Nº Partos']]  # Headers
            
            # Añadir datos
            for animal in datos:
                row = [
                    '●' if animal.get('Alletar', '').lower() == 'si' else '○',
                    animal.get('NOM', '#N/A'),
                    animal.get('COD', '#N/A'),
                    animal.get('DOB', '#N/A'),
                    animal.get('num_partos', '#N/A')
                ]
                table_data.append(row)
            
            # Crear tabla
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            elements.append(table)
            
            # Generar el PDF
            doc.build(elements)
            
            # Mostrar mensaje de éxito
            messagebox.showinfo("Éxito", "El fitxer PDF s'ha generat correctament")
            
            # Preguntar si desea abrir el archivo
            if messagebox.askyesno("Obrir fitxer", "Voleu obrir el fitxer PDF?"):
                os.startfile(filename) if os.name == 'nt' else os.system(f'xdg-open {filename}')
                
        except Exception as e:
            messagebox.showerror("Error", f"Error en generar el PDF: {str(e)}")