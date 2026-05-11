# core/http.py
# Cliente HTTP compartido para reutilizar conexiones

import httpx
from core.config import settings

# Cliente HTTP global para reutilizar conexiones
http_client = httpx.AsyncClient(timeout=10.0)

# Función para obtener cliente con timeout configurado
def get_client(timeout: float = 10.0) -> httpx.AsyncClient:
    """Devuelve un cliente HTTP con timeout configurable."""
    return httpx.AsyncClient(timeout=timeout)