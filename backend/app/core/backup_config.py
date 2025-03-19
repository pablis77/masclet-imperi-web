from pathlib import Path
from datetime import time

BACKUP_CONFIG = {
    "directory": Path("backups"),
    "schedule": time(hour=3, minute=0),  # 3 AM
    "keep_days": 7,
    "compression": True,
    "notify_on_failure": True
}