# services/airports.py
# Busca aeropuertos y ciudades por nombre
# No necesita API key - es publica de Travelpayouts

import httpx
from core.http import http_client
from core.cache import TTLCache

# Cache en memoria para busquedas de aeropuertos (TTL de 1 hora)
_aeropuertos_cache = TTLCache(ttl_seconds=3600)

# Grupos de aeropuertos alternativos cercanos a cada ciudad principal
# Cada grupo lista aeropuertos alternativos que sirven a la misma area metropolitana
AEROPUERTOS_CERCANOS: dict[str, list[str]] = {
    "MIA": ["FLL", "PBI"],
    "FLL": ["MIA", "PBI"],
    "JFK": ["LGA", "EWR"],
    "LGA": ["JFK", "EWR"],
    "EWR": ["JFK", "LGA"],
    "LAX": ["SNA", "BUR", "LGB", "ONT"],
    "SNA": ["LAX", "BUR", "LGB"],
    "SFO": ["OAK", "SJC"],
    "OAK": ["SFO", "SJC"],
    "SJC": ["SFO", "OAK"],
    "ORD": ["MDW"],
    "MDW": ["ORD"],
    "DCA": ["IAD", "BWI"],
    "IAD": ["DCA", "BWI"],
    "BWI": ["DCA", "IAD"],
    "DFW": ["DAL"],
    "DAL": ["DFW"],
    "IAH": ["HOU"],
    "HOU": ["IAH"],
    "LHR": ["LGW", "STN", "LTN", "LCY"],
    "LGW": ["LHR", "STN", "LTN"],
    "STN": ["LHR", "LGW", "LTN"],
    "LTN": ["LHR", "LGW", "STN"],
    "CDG": ["ORY", "BVA"],
    "ORY": ["CDG", "BVA"],
    "FCO": ["CIA"],
    "CIA": ["FCO"],
    "MAD": ["VLC", "BCN"],
    "BCN": ["MAD", "VLC"],
    "MXP": ["BGY", "LIN"],
    "LIN": ["MXP", "BGY"],
    "FRA": ["HHN"],
    "HHN": ["FRA"],
    "NRT": ["HND"],
    "HND": ["NRT"],
    "ICN": ["GMP"],
    "GMP": ["ICN"],
    "BKK": ["DMK"],
    "DMK": ["BKK"],
    "GRU": ["CGH", "VCP"],
    "CGH": ["GRU", "VCP"],
    "EZE": ["AEP"],
    "AEP": ["EZE"],
    "MEX": ["TLC", "QRO"],
    "SYD": ["MEL", "BNE", "OOL"],
    "MEL": ["SYD", "BNE"],
    "DXB": ["SHJ", "AUH"],
    "AUH": ["DXB", "SHJ"],
}


def aeropuertos_alternativos(iata: str) -> list[str]:
    """
    Devuelve aeropuertos alternativos cercanos a un codigo IATA.
    Util cuando no hay vuelos directos al aeropuerto principal.

    Args:
        iata: Codigo IATA del aeropuerto

    Returns:
        Lista de codigos IATA alternativos (max 4)
    """
    return AEROPUERTOS_CERCANOS.get(iata.upper(), [])[:4]

async def buscar_aeropuerto(texto: str) -> list[dict]:
    """
    Recibe lo que el usuario escribe, ej: "Carta"
    Devuelve lista de ciudades/aeropuertos con su codigo IATA

    Args:
        texto: Termino de busqueda del usuario

    Returns:
        Lista de diccionarios con 'nombre', 'pais' y 'codigo' (IATA)
    """
    # Verificar cache simple (en memoria)
    cache_key = texto.lower().strip()
    cached = _aeropuertos_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        # Llamada a API publica de Travelpayouts para autocompletado
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

        # Transformar respuesta al formato unificado del proyecto
        resultados = []
        for lugar in datos:
            resultados.append({
                "nombre": lugar.get("name"),
                "pais":   lugar.get("country_name"),
                "codigo": lugar.get("code"),
            })

        # Guardar en cache para proximas busquedas
        _aeropuertos_cache.set(cache_key, resultados)
        return resultados

    except Exception as e:
        from loguru import logger
        logger.warning(f"Error buscando aeropuertos '{texto}': {e}")
        cached = _aeropuertos_cache.get_expired(cache_key)
        if cached is not None:
            return cached
        return []