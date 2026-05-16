# core/cache.py
# Simple TTL (Time To Live) cache para funciones async
# Mejorar rendimiento evitando llamadas repetidas a APIs

import time
from typing import Any, Optional, Tuple


class TTLCache:
    """
    Cache simple con TTL (Time To Live) en segundos.

    Uso típico:
        cache = TTLCache(ttl_seconds=300)  # 5 minutos
        cache.set("key", value)
        value = cache.get("key")  # None si expiró o no existe

    Attributes:
        ttl: Tiempo de vida en segundos para cada entrada
    """

    def __init__(self, ttl_seconds: int = 300):
        """
        Inicializa el cache con un TTL por defecto.

        Args:
            ttl_seconds: Tiempo en segundos antes de expirar (default: 300 = 5 min)
        """
        self._cache: dict[str, Tuple[Any, float]] = {}
        self.ttl = ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """
        Obtiene un valor del cache si existe y no ha expirado.

        Args:
            key: Clave del cache

        Returns:
            El valor almacenado o None si expiro/no existe
        """
        if key in self._cache:
            value, timestamp = self._cache[key]
            if time.time() - timestamp < self.ttl:
                return value
            else:
                # Expiro, eliminar entrada
                del self._cache[key]
        return None

    def get_expired(self, key: str) -> Optional[Any]:
        """
        Obtiene un valor del cache incluso si ha expirado.
        Util para fallback cuando la fuente primaria falla.

        Args:
            key: Clave del cache

        Returns:
            El valor almacenado o None si no existe
        """
        if key in self._cache:
            value, _ = self._cache[key]
            return value
        return None

    def set(self, key: str, value: Any) -> None:
        """
        Almacena un valor en el cache con timestamp actual.

        Args:
            key: Clave del cache
            value: Valor a almacenar
        """
        self._cache[key] = (value, time.time())

    def clear(self) -> None:
        """Limpia todas las entradas del cache."""
        self._cache.clear()

    def __contains__(self, key: str) -> bool:
        """
        Verifica si una clave existe en el cache y no ha expirado.

        Args:
            key: Clave a verificar

        Returns:
            True si la clave existe y es válida, False si no
        """
        return self.get(key) is not None