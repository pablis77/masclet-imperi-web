import chardet

def check_file_encoding(file_path):
    with open(file_path, 'rb') as f:
        raw_data = f.read()
        result = chardet.detect(raw_data)
        return result['encoding'], result['confidence']

if __name__ == "__main__":
    file_path = "c:\\Proyectos\\claude\\masclet-imperi-web\\backend\\database\\matriz_master.csv"
    encoding, confidence = check_file_encoding(file_path)
    print(f"El archivo '{file_path}' tiene una codificación detectada como '{encoding}' con una confianza del {confidence * 100:.2f}%.")