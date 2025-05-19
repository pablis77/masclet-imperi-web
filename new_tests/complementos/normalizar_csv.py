import csv
import os

def normalizar_csv(archivo_entrada, archivo_salida):
    """
    Normaliza los nombres de las columnas del CSV para que sean consistentes
    con el formato esperado por el sistema.
    """
    print(f"Normalizando archivo {archivo_entrada} a {archivo_salida}...")
    
    # Mapeo de nombres de columnas a su versión normalizada
    mapeo_columnas = {
        'Alletar': 'alletar',
        'explotacio': 'explotacio',
        'NOM': 'nom',
        'Genere': 'genere',
        'Pare': 'pare',
        'Mare': 'mare',
        'Quadra': 'quadra',
        'COD': 'cod',
        'Num Serie': 'num_serie',
        'DOB': 'dob',
        'Estado': 'estado',
        'part': 'part',
        'GenereT': 'GenereT',
        'EstadoT': 'EstadoT'
    }
    
    # Leer el archivo original
    with open(archivo_entrada, 'r', encoding='utf-8') as entrada:
        reader = csv.reader(entrada, delimiter=';')
        encabezados = next(reader)  # Primera fila con encabezados
        
        # Normalizar encabezados
        encabezados_normalizados = []
        for encabezado in encabezados:
            if encabezado in mapeo_columnas:
                encabezados_normalizados.append(mapeo_columnas[encabezado])
            else:
                encabezados_normalizados.append(encabezado)
                print(f"ADVERTENCIA: Columna '{encabezado}' no está en el mapeo, se mantiene igual")
        
        # Escribir el archivo normalizado
        with open(archivo_salida, 'w', encoding='utf-8', newline='') as salida:
            writer = csv.writer(salida, delimiter=';')
            writer.writerow(encabezados_normalizados)  # Escribir encabezados normalizados
            
            # Copiar el resto de filas sin cambios
            for fila in reader:
                writer.writerow(fila)
    
    print(f"Archivo normalizado creado en {archivo_salida}")
    print(f"Encabezados originales: {encabezados}")
    print(f"Encabezados normalizados: {encabezados_normalizados}")

if __name__ == "__main__":
    # Rutas de archivos
    archivo_entrada = "backend/database/matriz_master.csv"
    archivo_salida = "backend/database/matriz_master_normalizado.csv"
    
    # Normalizar el archivo
    normalizar_csv(archivo_entrada, archivo_salida)
    
    print("\nAhora puedes importar el archivo normalizado usando el script import_matriz_master.py")
    print("Modifica la línea del archivo a importar en import_matriz_master.py:")
    print("    test_file_path = \"backend/database/matriz_master_normalizado.csv\"")
