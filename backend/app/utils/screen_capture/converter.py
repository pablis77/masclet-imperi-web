import pytesseract
from PIL import Image
import json
import os
from datetime import datetime

class ScreenCapture:
    def __init__(self):
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        self.output_dir = os.path.join(os.path.dirname(__file__), "screenshots")
        
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def process_screenshots(self, *image_paths: str) -> dict:
        """Procesa múltiples capturas y las combina en un solo JSON"""
        results = []
        for path in image_paths:
            try:
                img = Image.open(path)
                text = pytesseract.image_to_string(img)
                results.append({
                    "section": len(results) + 1,
                    "text_content": text,
                    "image_name": os.path.basename(path)
                })
            except Exception as e:
                results.append({
                    "section": len(results) + 1,
                    "error": str(e),
                    "image_name": os.path.basename(path)
                })

        output = {
            "timestamp": datetime.now().isoformat(),
            "type": "swagger_ui_capture",
            "sections": results
        }

        # Guardar JSON
        filename = f"swagger_capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        output_path = os.path.join(self.output_dir, filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        return output