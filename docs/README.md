# Masclet Imperi Web

## 📋 Descripción General
API y sistema de gestión para Masclet Imperi, desarrollado con FastAPI y PostgreSQL.

## 🛠️ Stack Tecnológico
- FastAPI
- PostgreSQL
- Docker
- Python 3.11

## 🚀 Instalación y Configuración

### Prerrequisitos
- Docker Desktop instalado y corriendo
- PowerShell con permisos de administrador
- Python 3.11
- Conda/Miniconda (recomendado)

### Configuración del Entorno
```powershell
# Crear entorno conda
conda create -n masclet-imperi python=3.11
conda activate masclet-imperi

# Instalar dependencias
cd backend
pip install -r requirements.txt

### Estructura Docker

### Comandos Principales

#### Gestión de Contenedores
```powershell
# Iniciar servicios
docker-compose up -d

# Ver estado de contenedores
docker-compose ps

# Ver logs
docker-compose logs api    # Logs de la API
docker-compose logs db     # Logs de PostgreSQL

# Detener servicios
docker-compose down
```

### 🧹 Docker Cleanup

```powershell
# Basic cleanup (containers and images)
.\docker\scripts\clean-docker.ps1

# Cleanup including volumes (with confirmation prompt)
.\docker\scripts\clean-docker.ps1 -RemoveVolumes

# Force cleanup including volumes (no prompt)
.\docker\scripts\clean-docker.ps1 -RemoveVolumes -Force
```

> ⚠️ Using `-RemoveVolumes` will delete all database data. Use with caution.

### 🧹 Maintenance Scripts

```powershell
# Clean old log files (default: older than 7 days)
.\docker\scripts\clean-logs.ps1

# Clean logs older than specific days
.\docker\scripts\clean-logs.ps1 -DaysToKeep 30
```

### 🔄 Log Management

```powershell
# Clean old logs (default: older than 7 days)
.\docker\scripts\clean-logs.ps1 -DaysToKeep 14

# Rotate large log files (default: larger than 10MB)
.\docker\scripts\rotate-logs.ps1 -MaxSizeMB 20
```

## 💾 Database Backup & Restore

### Creating a Backup
```powershell
# Create backup in default location
.\docker\scripts\backup-db.ps1

# Create backup in custom location
.\docker\scripts\backup-db.ps1 -BackupPath "C:\custom\path"
```

### Restoring from Backup
```powershell
# Restore most recent backup
$lastBackup = Get-ChildItem ".\docker\volumes\postgres\backups\backup_*.sql" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 1
.\docker\scripts\restore-db.ps1 -BackupFile $lastBackup.FullName

# Restore specific backup
.\docker\scripts\restore-db.ps1 -BackupFile "path\to\specific\backup.sql"
```

Backups are stored in `docker/volumes/postgres/backups` by default with timestamp format: `backup_YYYYMMDD_HHMMSS.sql`

### 📊 Monitoring

```powershell
# Show current status
.\docker\scripts\show-status.ps1

# Watch mode (updates every 5 seconds)
.\docker\scripts\show-status.ps1 -Watch
```

## Git Workflow

### Daily Process
```bash
# Start of day
git pull origin main

# Saving changes
git add .
git commit -m "tipo(scope): descripción"
git push origin main
```
