from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel

class MessageType(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    INFO = "info"
    WARNING = "warning"

class APIMessage(BaseModel):
    type: MessageType
    message: str
    data: Optional[Dict[str, Any]] = None
    duration: int = 3000

class MessageResponse(BaseModel):
    message: str
    type: MessageType = MessageType.INFO
    data: Optional[Dict[str, Any]] = None
    status_code: int = 200