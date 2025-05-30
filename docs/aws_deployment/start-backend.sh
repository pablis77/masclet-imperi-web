#!/bin/bash
# Script de inicio para backend de Masclet Imperi en EC2

# Directorio de la aplicación
APP_DIR="/home/ec2-user/masclet-imperi/backend"
LOG_DIR="/home/ec2-user/masclet-imperi/logs"
VENV_DIR="/home/ec2-user/masclet-imperi/venv"

# Crear directorios si no existen
mkdir -p $LOG_DIR

# Activar entorno virtual
source $VENV_DIR/bin/activate

# Ir al directorio de la aplicación
cd $APP_DIR

# Verificar si hay migraciones pendientes
echo "Verificando migraciones..."
python -m aerich upgrade

# Iniciar la aplicación con Gunicorn
echo "Iniciando servidor Masclet Imperi..."
gunicorn app.main:app \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --timeout 300 \
  --access-logfile $LOG_DIR/access.log \
  --error-logfile $LOG_DIR/error.log \
  --log-level info \
  --daemon

echo "Servidor iniciado en puerto 8000"

# Verificar que el servidor está en funcionamiento
sleep 5
if curl -s http://localhost:8000/api/v1/health | grep -q "ok"; then
  echo "Servidor funcionando correctamente"
else
  echo "¡ADVERTENCIA! El servidor podría no estar funcionando correctamente"
fi
