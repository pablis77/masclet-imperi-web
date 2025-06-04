from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
import os

app = FastAPI(title="Masclet Imperi API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de salud
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}

# Endpoint de autenticación temporal
@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return {
        "access_token": "temporary_token_while_backend_is_restored",
        "token_type": "bearer"
    }

# Endpoint de autenticación con prefijo API
@app.post("/api/v1/auth/login")
async def login_api(form_data: OAuth2PasswordRequestForm = Depends()):
    return {
        "access_token": "temporary_token_while_backend_is_restored",
        "token_type": "bearer"
    }

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgres://admin:admin123@db:5432/masclet_imperi")

register_tortoise(
    app,
    db_url=DATABASE_URL,
    modules={"models": []},
    generate_schemas=True,
    add_exception_handlers=True,
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
