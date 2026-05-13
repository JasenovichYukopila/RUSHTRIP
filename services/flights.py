# services/flights.py
# Servicio de búsqueda de vuelos usando Travelpayouts API
# Implementa estrategia de fallback en 3 niveles para máxima cobertura

import httpx
import logging
from core.config import settings
from core.http import http_client

logger = logging.getLogger(__name__)

# Mapeo de códigos IATA de aerolíneas a nombres legibles
AEROLINEAS = {
    "AV": "Avianca",
    "AA": "American Airlines",
    "LA": "LATAM",
    "CM": "Copa Airlines",
    "UA": "United Airlines",
    "DL": "Delta",
    "IB": "Iberia",
    "B6": "JetBlue",
    "NK": "Spirit",
    "AZ": "ITA Airways",
    "AF": "Air France",
    "KL": "KLM",
    "DM": "Arajet",
    "VH": "Viva Air",
    "P5": "EASYFLY",
}

# Descripciones detalladas de cada aerolínea para mostrar al usuario
DESCRIPCION_AEROLINEA = {
    "AV": "Aerolínea bandera de Colombia, con hub en Bogotá y más de 70 destinos internacionales.",
    "AA": "American Airlines, una de las mayores aerolíneas de EE.UU., con amplia red de vuelos internacionales.",
    "LA": "LATAM Airlines, líder en América Latina, con vuelos a más de 140 destinos en 25 países.",
    "CM": "Copa Airlines, con hub en Panamá, conecta toda América con uno de los mejores rankings de puntualidad.",
    "UA": "United Airlines, aerolínea global con hubs en Chicago, Newark, Houston y Denver.",
    "DL": "Delta Air Lines, una de las aerolíneas más grandes del mundo, con base en Atlanta.",
    "IB": "Iberia, aerolinea bandera de España, conecta Europa con América Latina.",
    "B6": "JetBlue, aerolinea low-cost de EE.UU. con amplia cobertura y servicio a Latinoamérica.",
    "NK": "Spirit Airlines, aerolinea ultra low-cost de EE.UU., ideal para viajes económicos.",
    "AZ": "ITA Airways, aerolinea bandera de Italia, con hub en Roma y Milán.",
    "AF": "Air France, aerolinea bandera de Francia, con hub en París-Charles de Gaulle.",
    "KL": "KLM, aerolinea bandera de los Países Bajos, con hub en Ámsterdam-Schiphol.",
    "DM": "Arajet, aerolinea dominicana low-cost en expansión por América.",
    "VH": "Viva Air, aerolinea low-cost colombiana con rutas regionales.",
    "P5": "EASYFLY, aerolinea low-cost colombiana de bajo costo.",
}


def logo_aerolinea(iata: str) -> str:
    """
    Genera URL del logo de una aerolinea usando el servicio avs.io.
    Los logos están disponibles para códigos IATA estándar.
    """
    return f"http://pics.avs.io/100/100/{iata}.png"


def link_compra(link: str, marker: str) -> str:
    """
    Construye link de compra con marcador de afiliado.
    Añade el marker de Travelpayouts al link del vuelo.
    """
    sep = "&" if "?" in link else "?"
    return f"https://www.aviasales.com{link}{sep}marker={marker}"


def _mes_desde_fecha(fecha: str) -> str:
    """Extrae el año-mes de una fecha YYYY-MM-DD → YYYY-MM"""
    return fecha[:7]


async def buscar_vuelos(
    origen: str,
    destino: str,
    fecha_salida: str,
    fecha_regreso: str,
    pasajeros: int = 1,
) -> dict:
    """
    Busca vuelos con estrategia de 3 niveles para máxima cobertura:
      1. Fecha exacta (cache hit si la ruta es popular)
      2. Mes completo de salida (mayor cobertura en cache)
      3. Sin fecha (próximos disponibles como último recurso)

    Args:
        origen: Código IATA del aeropuerto de origen (ej: BOG)
        destino: Código IATA del aeropuerto de destino (ej: MIA)
        fecha_salida: Fecha de salida en formato YYYY-MM-DD
        fecha_regreso: Fecha de regreso en formato YYYY-MM-DD
        pasajeros: Número de pasajeros (default: 1)

    Returns:
        Dict con 'aviso' (str|None), 'vuelos' (list) y 'precision' (str)
    """
    try:
        # Nivel 1: buscar con fechas exactas
        resultado = await _buscar(origen, destino, fecha_salida, fecha_regreso, pasajeros)
        if resultado["vuelos"]:
            resultado["precision"] = "exacta"
            return resultado

        # Nivel 2: buscar por mes (YYYY-MM) si no hay resultados exactos
        # Esto captura vuelos en cualquier día del mes solicitado
        mes_salida  = _mes_desde_fecha(fecha_salida)
        mes_regreso = _mes_desde_fecha(fecha_regreso)
        resultado_mes = await _buscar(origen, destino, mes_salida, mes_regreso, pasajeros)

        if resultado_mes["vuelos"]:
            # Filtrar los vuelos del mes que sean >= fecha_salida solicitada
            # No queremos mostrar vuelos antes de la fecha deseada
            vuelos_filtrados = [
                v for v in resultado_mes["vuelos"]
                if v.get("salida", "")[:10] >= fecha_salida
            ]
            # Si el filtro deja vacío, usar todos los del mes
            vuelos_a_usar = vuelos_filtrados if vuelos_filtrados else resultado_mes["vuelos"]

            primer = vuelos_a_usar[0]
            return {
                "aviso": (
                    f"No encontramos vuelos para el {fecha_salida} exacto. "
                    f"Te mostramos las mejores opciones disponibles en {mes_salida}. "
                    f"El más económico sale el {primer['salida'][:10]}."
                ),
                "precision": "mes",
                "vuelos": vuelos_a_usar,
            }

        # Nivel 3: buscar próximos disponibles sin filtro de fecha
        # Último recurso cuando no hay nada exacto
        resultado_libre = await _buscar(origen, destino, None, None, pasajeros)
        if resultado_libre["vuelos"]:
            primer = resultado_libre["vuelos"][0]
            return {
                "aviso": (
                    f"No hay vuelos disponibles para {fecha_salida}. "
                    f"El vuelo más económico disponible sale el {primer['salida'][:10]}. "
                    f"El precio podría variar al momento de reservar."
                ),
                "precision": "aproximada",
                "vuelos": resultado_libre["vuelos"],
            }

        # No se encontraron vuelos en ningún nivel
        return {
            "aviso": "No se encontraron vuelos para esta ruta en este momento.",
            "precision": "sin_resultados",
            "vuelos": [],
        }

    except Exception as e:
        logger.error(f"Error buscando vuelos: {e}")
        return {
            "aviso": "Error interno al buscar vuelos. Por favor, intente nuevamente.",
            "precision": "error",
            "vuelos": [],
        }


async def _buscar(
    origen: str,
    destino: str,
    fecha_salida: str | None,
    fecha_regreso: str | None,
    pasajeros: int,
) -> dict:
    """
    Llamada directa a la API prices_for_dates de Travelpayouts.
    Acepta fechas exactas (YYYY-MM-DD) o por mes (YYYY-MM).
    Si fecha_salida es None, busca próximos disponibles sin filtro.

    Args:
        origen: Código IATA origen
        destino: Código IATA destino
        fecha_salida: Fecha en formato YYYY-MM-DD o YYYY-MM (o None)
        fecha_regreso: Fecha en formato YYYY-MM-DD o YYYY-MM (o None)
        pasajeros: Número de pasajeros

    Returns:
        Dict con 'aviso' y 'vuelos' (lista)
    """
    # Construir parámetros para la API de Travelpayouts
    params = {
        "origin":      origen.upper(),
        "destination": destino.upper(),
        "token":       settings.travelpayouts_token,
        "currency":    "USD",
        "sorting":     "price",  # Ordenar por precio (más bajo primero)
        "limit":       15,       # Pedir más para poder filtrar después
    }

    # Añadir fechas solo si están presentes
    if fecha_salida:
        params["departure_at"] = fecha_salida
    if fecha_regreso:
        params["return_at"] = fecha_regreso

    try:
        # Llamada a la API de Travelpayouts
        res = await http_client.get(
            "https://api.travelpayouts.com/aviasales/v3/prices_for_dates",
            params=params,
        )
        res.raise_for_status()
        data = res.json()

        logger.debug(f"Respuesta API vuelos [{fecha_salida or 'sin-fecha'}]: {data}")

        # Verificar que la API devolvió datos válidos
        if not data.get("success") or not data.get("data"):
            logger.warning(f"Sin datos para {origen}→{destino} [{fecha_salida}]")
            return {"aviso": None, "vuelos": []}

        # Transformar datos de la API al formato unificado
        vuelos = []
        for v in data["data"]:
            iata   = v.get("airline", "??")
            precio = float(v.get("price", 0))
            escalas = v.get("transfers", 0)

            # Convertir número de escalas a texto legible
            if escalas == 0:
                escalas_texto = "Directo"
            elif escalas == 1:
                escalas_texto = "1 escala"
            else:
                escalas_texto = f"{escalas} escalas"

            # Calcular precio total multiplicando por pasajeros
            vuelos.append({
                "aerolinea":          iata,
                "aerolinea_nombre":   AEROLINEAS.get(iata, iata),
                "descripcion":        DESCRIPCION_AEROLINEA.get(iata, ""),
                "logo_url":           logo_aerolinea(iata),
                "salida":             v.get("departure_at", ""),
                "origen":             v.get("origin_airport", origen),
                "destino":            v.get("destination_airport", destino),
                "duracion_minutos":   v.get("duration_to", v.get("duration", 0)),
                "escalas":            escalas,
                "escalas_texto":      escalas_texto,
                "precio_por_persona": precio,
                "precio_total":       round(precio * pasajeros, 2),
                "pasajeros":          pasajeros,
                "link_compra":        link_compra(
                                          v.get("link", ""),
                                          settings.travelpayouts_marker,
                                      ),
            })

        return {
            "aviso":  None,
            "vuelos": sorted(vuelos, key=lambda x: x["precio_por_persona"]),  # Ordenar por precio
        }

    except httpx.HTTPStatusError as e:
        logger.error(f"Error HTTP vuelos: {e.response.status_code} - {e.response.text}")
        return {"aviso": None, "vuelos": []}
    except httpx.RequestError as e:
        logger.error(f"Error de conexión vuelos: {e}")
        return {"aviso": None, "vuelos": []}
    except Exception as e:
        logger.error(f"Error inesperado en _buscar: {e}")
        return {"aviso": None, "vuelos": []}