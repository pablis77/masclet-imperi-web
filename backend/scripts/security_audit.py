"""
Script para auditar seguridad y detectar posibles problemas de seguridad
"""
import os
import re
import sys
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional
import logging

# Configuración básica de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Directorio raíz del proyecto (directorio actual)
ROOT_DIR = Path(__file__).parent.parent
BACKEND_DIR = ROOT_DIR
FRONTEND_DIR = ROOT_DIR.parent / "frontend"

# Patrones para buscar posibles problemas de seguridad
PATTERNS = {
    "password": re.compile(r'password.*?["\']([^"\']+)["\']', re.IGNORECASE),
    "secret_key": re.compile(r'secret[_-]?key.*?["\']([^"\']+)["\']', re.IGNORECASE),
    "api_key": re.compile(r'api[_-]?key.*?["\']([^"\']+)["\']', re.IGNORECASE),
    "token": re.compile(r'token.*?["\']([^"\']+)["\']', re.IGNORECASE),
    "admin_credentials": re.compile(r'admin.*password.*?["\']([^"\']+)["\']', re.IGNORECASE),
    "hard_coded_url": re.compile(r'https?://[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', re.IGNORECASE),
    "jwt_secret": re.compile(r'jwt.*secret.*?["\']([^"\']+)["\']', re.IGNORECASE),
}

# Archivos seguros en los que se espera tener credenciales
SAFE_FILES = [
    ".env.example",
    "config.py",  # Las credenciales aquí son valores predeterminados para variables de entorno
    "test_",  # Cualquier archivo que comience con test_
    "fixtures",
    "security_audit.py",
]

# Extensiones de archivo a verificar
FILE_EXTENSIONS = [
    ".py", ".js", ".jsx", ".ts", ".tsx", ".vue", 
    ".html", ".astro", ".svelte", ".json", ".yml", ".yaml",
    ".env.development", ".env.production"  # Asegurarse que las credenciales no estén en estos archivos
]

# Extensiones a excluir
EXCLUDE_EXTENSIONS = [
    ".pyc", ".pyo", ".pyd", ".git", ".vscode", 
    ".idea", ".DS_Store", ".env", "__pycache__",
    ".log", ".sqlite", ".db", ".jpg", ".png", ".svg",
    ".ico", ".gif", ".woff", ".woff2", ".ttf", ".eot"
]

# Directorios a excluir
EXCLUDE_DIRS = [
    "node_modules", "dist", "build", "venv", ".venv", 
    "env", ".env", "__pycache__", ".git", ".github",
    ".idea", ".vscode", "coverage", "static", "media",
    "assets"
]

def is_safe_file(file_path: str) -> bool:
    """Verifica si el archivo es seguro para contener credenciales"""
    for safe_pattern in SAFE_FILES:
        if safe_pattern in file_path:
            return True
    return False

def should_scan_file(file_path: str) -> bool:
    """Determina si el archivo debe ser escaneado"""
    # Verificar extensión
    ext = os.path.splitext(file_path)[1].lower()
    if not any(file_path.endswith(ext) for ext in FILE_EXTENSIONS):
        return False
    
    # Verificar si está en lista de exclusiones
    if any(excl in file_path for excl in EXCLUDE_EXTENSIONS):
        return False
    
    # Verificar si está en directorio excluido
    if any(f"/{excl}/" in file_path.replace("\\", "/") for excl in EXCLUDE_DIRS):
        return False
    
    return True

def scan_file(file_path: str) -> List[Dict]:
    """
    Escanea un archivo en busca de posibles problemas de seguridad
    
    Args:
        file_path: Ruta al archivo a escanear
        
    Returns:
        Lista de problemas encontrados
    """
    issues = []
    is_safe = is_safe_file(file_path)
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
            for issue_type, pattern in PATTERNS.items():
                matches = pattern.findall(content)
                
                for match in matches:
                    # Si es un archivo seguro, solo registramos para información
                    risk_level = "BAJO" if is_safe else "ALTO"
                    
                    # Determinar si es una credencial real o un valor por defecto
                    is_default = any(keyword in match.lower() for keyword in 
                                    ["placeholder", "example", "your_", "default", 
                                     "change_me", "change-me", "changeme"])
                    
                    if is_default:
                        risk_level = "BAJO"
                    
                    # Si parece una URL normal y no una credencial, es riesgo bajo
                    if issue_type == "hard_coded_url" and not any(
                        keyword in match.lower() for keyword in 
                        ["token", "key", "secret", "password", "auth"]
                    ):
                        risk_level = "BAJO"
                    
                    # Añadir el problema encontrado
                    issues.append({
                        "file": file_path,
                        "type": issue_type,
                        "risk": risk_level,
                        "value": match if risk_level == "BAJO" else f"{match[:5]}..." # Truncar valores sensibles
                    })
    except Exception as e:
        logger.error(f"Error al escanear {file_path}: {str(e)}")
    
    return issues

def scan_directory(directory: Path) -> List[Dict]:
    """
    Escanea un directorio recursivamente
    
    Args:
        directory: Directorio a escanear
        
    Returns:
        Lista de problemas encontrados
    """
    all_issues = []
    
    for root, dirs, files in os.walk(directory):
        # Excluir directorios que no queremos escanear
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            file_path = os.path.join(root, file)
            
            if should_scan_file(file_path):
                issues = scan_file(file_path)
                all_issues.extend(issues)
    
    return all_issues

def generate_report(issues: List[Dict], output_file: Optional[str] = None) -> None:
    # También crear un informe de texto simple
    txt_output = output_file.replace(".json", ".txt") if output_file else None
    """
    Genera un informe con los problemas encontrados
    
    Args:
        issues: Lista de problemas
        output_file: Archivo de salida (opcional)
    """
    # Agrupar por nivel de riesgo
    high_risk = [issue for issue in issues if issue["risk"] == "ALTO"]
    low_risk = [issue for issue in issues if issue["risk"] == "BAJO"]
    
    # Crear informe
    report = {
        "timestamp": logging.Formatter().converter(),
        "summary": {
            "total_issues": len(issues),
            "high_risk": len(high_risk),
            "low_risk": len(low_risk)
        },
        "high_risk_issues": high_risk,
        "low_risk_issues": low_risk
    }
    
    # Guardar en archivo si se especificó
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        logger.info(f"Informe JSON guardado en {output_file}")
        
        # Guardar versión de texto simple
        if txt_output:
            with open(txt_output, 'w', encoding='utf-8') as f:
                f.write("=== INFORME DE AUDITORÍA DE SEGURIDAD ===\n\n")
                f.write(f"Total de problemas encontrados: {len(issues)}\n")
                f.write(f"Problemas de alto riesgo: {len(high_risk)}\n")
                f.write(f"Problemas de bajo riesgo: {len(low_risk)}\n\n")
                
                if high_risk:
                    f.write("=== PROBLEMAS DE ALTO RIESGO ===\n")
                    for issue in high_risk:
                        f.write(f"Archivo: {issue['file']}\n")
                        f.write(f"Tipo: {issue['type']}\n")
                        f.write(f"Valor: {issue['value']}\n")
                        f.write("---\n")
            logger.info(f"Informe de texto guardado en {txt_output}")
    
    # Mostrar resumen en consola
    logger.info("=== RESUMEN DE AUDITORÍA DE SEGURIDAD ===")
    logger.info(f"Total de problemas encontrados: {len(issues)}")
    logger.info(f"Problemas de alto riesgo: {len(high_risk)}")
    logger.info(f"Problemas de bajo riesgo: {len(low_risk)}")
    
    if high_risk:
        logger.warning("=== PROBLEMAS DE ALTO RIESGO ===")
        for issue in high_risk:
            logger.warning(f"Archivo: {issue['file']}")
            logger.warning(f"Tipo: {issue['type']}")
            logger.warning(f"Valor: {issue['value']}")
            logger.warning("---")
    
    return report

def main():
    """Función principal"""
    logger.info("Iniciando auditoría de seguridad...")
    
    # Escanear backend
    logger.info(f"Escaneando backend en {BACKEND_DIR}...")
    backend_issues = scan_directory(BACKEND_DIR)
    
    # Escanear frontend
    logger.info(f"Escaneando frontend en {FRONTEND_DIR}...")
    frontend_issues = scan_directory(FRONTEND_DIR)
    
    # Combinar resultados
    all_issues = backend_issues + frontend_issues
    
    # Generar informe
    report_file = ROOT_DIR / "security_audit_report.json"
    report = generate_report(all_issues, str(report_file))
    
    # Sugerir soluciones
    if report["summary"]["high_risk"] > 0:
        logger.warning("\n=== RECOMENDACIONES ===")
        logger.warning("1. Mover todas las credenciales a variables de entorno (.env)")
        logger.warning("2. Utilizar valores de ejemplo en los archivos .env.example")
        logger.warning("3. Revisar y corregir las credenciales hardcodeadas en los archivos mencionados")
        logger.warning("4. Asegurarse de que los archivos .env estén en .gitignore")
        
        return 1  # Código de error
    else:
        logger.info("\n✅ No se encontraron problemas de alto riesgo.")
        return 0  # Éxito

if __name__ == "__main__":
    sys.exit(main())
