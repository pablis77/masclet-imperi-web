# Dockerfile optimizado para Masclet Imperi API

# Stage 1: Compilación y dependencias
FROM python:3.11.11-slim as builder

# Configuración de pip
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalación de dependencias de compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Creación de virtualenv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copiado e instalación de dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Stage 2: Imagen final
FROM python:3.11.11-slim

# Variables de entorno
ENV PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Instalación de dependencias runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copiado de virtualenv y código
COPY --from=builder /opt/venv /opt/venv
COPY ./app /app/app

# Usuario no privilegiado
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Healthcheck - Usando curl instalado en la imagen base
HEALTHCHECK --interval=30s --timeout=30s --retries=3 \
    CMD ["bash", "-c", "exec 3<>/dev/tcp/localhost/8000 && echo -e 'GET /api/v1/health HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3 && cat <&3 | grep -q 'ok'"]

# Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]