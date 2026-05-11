# services/airports.py
# Busca aeropuertos y ciudades por nombre
# No necesita API key — es pública de Travelpayouts

import httpx
import time
from functools import lru_cache
from core.http import http_client

# Cache para búsquedas de aeropuertos (TTL de 1 hora)
_aeropuertos_cache = {}

@lru_cache(maxsize=128)
def _get_cached_aeropuertos(texto: str) -> list[dict]:
    """Versión síncrona cacheada de la búsqueda."""
    # Esta función no hace nada, solo sirve para que lru_cache funcione
    # La lógica real está en buscar_aeropuerto
    return []

async def buscar_aeropuerto(texto: str) -> list[dict]:
    """
    Recibe lo que el usuario escribe, ej: "Carta"
    Devuelve lista de ciudades/aeropuertos con su código IATA
    """
    # Verificar cache simple (en memoria)
    cache_key = texto.lower().strip()
    if cache_key in _aeropuertos_cache:
        cached_data, timestamp = _aeropuertos_cache[cache_key]
        # Cache válido por 1 hora
        if time.time() - timestamp < 3600:
            return cached_data
    
    try:
        res = await http_client.get(
            "https://autocomplete.travelpayouts.com/places2",
            params={
                "term":   texto,
                "locale": "es",
                "types":  "city",
            }
        )
        res.raise_for_status()
        datos = res.json()

        resultados = []
        for lugar in datos:
            resultados.append({
                "nombre": lugar.get("name"),
                "pais":   lugar.get("country_name"),
                "codigo": lugar.get("code"),
            })
        
        # Guardar en cache
        _aeropuertos_cache[cache_key] = (resultados, time.time())
        
        return resultados
    except Exception as e:
        # En caso de error, intentar devolver cache expirado si existe
        if cache_key in _aeropuertos_cache:
            cached_data, _ = _aeropuertos_cache[cache_key]
            return cached_data
        raise e