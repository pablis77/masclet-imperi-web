import tkinter as tk
from tkinter import ttk
from config.settings import UI_STYLES
from utils.logger import setup_logging
from PIL import Image, ImageTk
import os
import logging  # Agregamos este import
from utils.logger import setup_logging

# Configurar el logger
logger = setup_logging()

class UIManager:
    @staticmethod
    def apply_styles(widget):
        """Aplica estilos consistentes a los widgets"""
        if isinstance(widget, tk.Button):
            widget.configure(**UI_STYLES['button_style'])
        elif isinstance(widget, ttk.Label):
            widget.configure(
                font=(UI_STYLES['font_family'], UI_STYLES['font_size'])
            )
            
    @staticmethod
    def create_styled_button(parent, **kwargs):
        """Crea un botón con los estilos de la aplicación"""
        button = tk.Button(
            parent,
            font=(UI_STYLES['font_family'], UI_STYLES['font_size']),
            **UI_STYLES['button_style'],
            **kwargs
        )
        return button
        
    @staticmethod
    def load_and_resize_image(image_path, size):
        """Carga y redimensiona imágenes de manera segura"""
        try:
            image = Image.open(image_path)
            image = image.resize(size, Image.Resampling.LANCZOS)
            return ImageTk.PhotoImage(image)
        except Exception as e:
            logging.error(f"Error al cargar imagen {image_path}: {e}")
            return None