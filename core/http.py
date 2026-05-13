# core/http.py
# Cliente HTTP compartido para reutilizar conexiones
# Evita crear nuevas conexiones para cada request

import httpx
from core.config import settings


# Cliente HTTP global configurado con timeout de 10 segundos
# Usado por todos los servicios para hacer llamadas a APIs externas
# Reutilizar el cliente mejora el rendimiento al mantener conexiones vivas
http_client = httpx.AsyncClient(timeout=10.0)


def get_client(timeout: float = 10.0) -> httpx.AsyncClient:
    """
    Devuelve un cliente HTTP con timeout configurable.
    Útil para endpoints que necesitan más tiempo de espera.

    Args:
        timeout: Tiempo máximo de espera en segundos (default: 10)

    Returns:
        Instancia de AsyncClient configurada
    """
    return httpx.AsyncClient(timeout=timeout)