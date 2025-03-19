from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response
from typing import Any
import json
import logging

class MessageMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
            
            if not isinstance(response, JSONResponse):
                return response
                
            body = response.body.decode()
            if not body:
                return response
                    
            data = json.loads(body)
            
            # Check if response already has our format
            if all(key in data for key in ["message", "type", "data"]):
                return response
                    
            # Only transform raw data responses
            return JSONResponse(
                content={
                    "message": "Success",
                    "type": "success",
                    "data": data,
                },
                status_code=response.status_code,
                headers=dict(response.headers)
            )
                
        except Exception as e:
            logging.error(f"Middleware error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "message": "Internal server error",
                    "type": "error",
                    "data": None
                }
            )