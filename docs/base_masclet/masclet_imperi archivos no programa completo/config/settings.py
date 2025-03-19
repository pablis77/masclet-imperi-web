# 1. Crear un archivo de configuración (config/settings.py)
import os

IMAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'IMAGES')

# Y luego usar
logo_path = os.path.join(IMAGES_DIR, 'logo_masclet.png')

# Configuración de la aplicación
APP_NAME = "MASCLET IMPERI"
VERSION = "1.0.0"
WINDOW_SIZE = "800x900"

# Rutas de archivos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'matriz_master.csv')
BACKUP_DIR = os.path.join(BASE_DIR, 'copias de seguridad')
IMAGES_DIR = os.path.join(BASE_DIR, 'IMAGES')

# Configuración de la UI
UI_STYLES = {
    'main_bg': 'white',
    'font_family': 'Arial',
    'font_size': 11,
    'button_style': {
        'relief': 'solid',
        'bd': 1,
        'bg': 'white'
    }
}

# Configuración de roles y permisos
ROLES = {
    'administrador': ['consultar', 'actualizar', 'crear', 'gestionar_usuarios'],
    'editor': ['consultar', 'actualizar'],
    'usuario': ['consultar']
}