from fastapi.openapi.utils import get_openapi
import json
from datetime import datetime
import pyautogui
import os

def capture_swagger_ui():
    """Captura completa de Swagger UI"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Captura estructura OpenAPI
    openapi_data = get_openapi(
        title="Masclet Imperi API",
        version="2.0.0",
        routes=app.routes,
        description="API Documentation"
    )
    
    # Captura visual
    screenshot = pyautogui.screenshot()
    image_name = f"swagger_ui_{timestamp}.png"
    screenshot.save(f"screenshots/{image_name}")
    
    # Estructura completa
    capture_data = {
        "timestamp": datetime.now().isoformat(),
        "type": "swagger_ui_capture",
        "openapi_spec": openapi_data,
        "endpoints": {
            route.path: {
                "method": route.methods,
                "tags": route.tags,
                "summary": route.summary,
                "description": route.description
            }
            for route in app.routes
        },
        "screenshot": image_name
    }
    
    # Guardar JSON
    with open(f"screenshots/swagger_capture_{timestamp}.json", "w", encoding="utf-8") as f:
        json.dump(capture_data, f, indent=2, ensure_ascii=False)