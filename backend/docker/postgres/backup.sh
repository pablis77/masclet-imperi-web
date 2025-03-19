#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME=${POSTGRES_DB:-masclet_imperi}
DB_USER=${POSTGRES_USER:-postgres}

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup of $DB_NAME at $TIMESTAMP..."
pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql" -type f -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql"