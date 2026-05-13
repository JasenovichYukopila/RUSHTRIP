# services/airports.py
# Busca aeropuertos y ciudades por nombre
# No necesita API key — es pública de Travelpayouts

import httpx
import time
from core.http import http_client

# Cache en memoria para búsquedas de aeropuertos (TTL de 1 hora)
# Mejora rendimiento evitando llamadas repetidas a la API
_aeropuertos_cache = {}

async def buscar_aeropuerto(texto: str) -> list[dict]:
    """
    Recibe lo que el usuario escribe, ej: "Carta"
    Devuelve lista de ciudades/aeropuertos con su código IATA

    Args:
        texto: Término de búsqueda del usuario

    Returns:
        Lista de diccionarios con 'nombre', 'pais' y 'codigo' (IATA)
    """
    # Verificar cache simple (en memoria)
    cache_key = texto.lower().strip()
    if cache_key in _aeropuertos_cache:
        cached_data, timestamp = _aeropuertos_cache[cache_key]
        # Cache válido por 1 hora (3600 segundos)
        if time.time() - timestamp < 3600:
            return cached_data

    try:
        # Llamada a API pública de Travelpayouts para autocompletado
        # No requiere autenticación
        res = await http_client.get(
            "https://autocomplete.travelpayouts.com/places2",
            params={
                "term":   texto,        # Término de búsqueda
                "locale": "es",         # Idioma español
                "types":  "city",       # Solo ciudades (no airports)
            }
        )
        res.raise_for_status()
        datos = res.json()

        # Transformar respuesta al formato unificado del proyecto
        resultados = []
        for lugar in datos:
            resultados.append({
                "nombre": lugar.get("name"),           # Nombre ciudad
                "pais":   lugar.get("country_name"),    # País
                "codigo": lugar.get("code"),            # Código IATA (ej: BOG)
            })

        # Guardar en cache para próximas búsquedas
        _aeropuertos_cache[cache_key] = (resultados, time.time())

        return resultados
    except Exception as e:
        # En caso de error, intentar devolver cache expirado si existe
        # Mejor dar datos antiguos que ningún dato
        if cache_key in _aeropuertos_cache:
            cached_data, _ = _aeropuertos_cache[cache_key]
            return cached_data
        raise e