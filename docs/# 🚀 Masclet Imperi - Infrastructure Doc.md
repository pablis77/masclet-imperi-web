# 🚀 Masclet Imperi - Infrastructure Documentation

## 🛠 Current Infrastructure

### Database Server
- **Type**: PostgreSQL 17
- **Container**: masclet_imperi_db
- **Status**: ✅ Running
- **Ports**: 5432:5432
- **Credentials**:
  - Database: masclet_imperi
  - User: postgres
  - Password: 1234 (development only)
  - Host: localhost

### Docker Images
- `postgres:17` (434.72MB) - Primary database
- `masclet-imperi-web-api:latest` (197MB) - API implementation
- `masclet-imperi-web-api:backup_v1` (197MB) - Backup of initial API

### Backup System
- Location: `./docker/postgres/backups/`
- Naming: `backup_YYYYMMDD_HHMMSS.sql`
- Retention: Last 4 backups
- Verification: Automatic integrity checks

### Health Monitoring
- Database healthchecks every 10s
- Automatic restart unless stopped
- Log rotation enabled (10MB max, 3 files)

## 🎯 Development Commands
```powershell
# Infrastructure Management
.\scripts\docker-manage.ps1 -Action start    # Start all services
.\scripts\docker-manage.ps1 -Action stop     # Stop all services
.\scripts\docker-manage.ps1 -Action status   # Check system status

# Backup Management
.\scripts\docker-manage.ps1 -Action backup   # Create new backup
.\scripts\docker-manage.ps1 -Action verify   # Verify latest backup
.\scripts\docker-manage.ps1 -Action restore -BackupFile "path.sql"  # Restore from backup

# Development Tools
.\scripts\docker-manage.ps1 -Action init-test  # Initialize test data
.\scripts\docker-manage.ps1 -Action clean      # Clean unused resources
```