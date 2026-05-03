# services/flights.py
import httpx
from core.config import settings

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
}

def logo_aerolinea(iata: str) -> str:
    return f"http://pics.avs.io/100/100/{iata}.png"

def link_compra(link: str, marker: str) -> str:
    return f"https://www.aviasales.com{link}&marker={marker}"

async def buscar_vuelos(
    origen: str,
    destino: str,
    fecha_salida: str,
    fecha_regreso: str,
    pasajeros: int = 1,
) -> dict:
    
    # Intentar con fechas exactas primero
    resultado = await _buscar(origen, destino, fecha_salida, fecha_regreso, pasajeros)
    
    if resultado["vuelos"]:
        return resultado

    # Si no hay resultados, buscar sin fechas (próximos disponibles)
    resultado_fallback = await _buscar(origen, destino, None, None, pasajeros)

    if resultado_fallback["vuelos"]:
        primer = resultado_fallback["vuelos"][0]
        resultado_fallback["aviso"] = (
            f"No hay vuelos disponibles para las fechas solicitadas. "
            f"El vuelo más cercano disponible sale el "
            f"{primer['salida'][:10]} y regresa el {primer['regreso'][:10]}."
        )
        return resultado_fallback

    return {
        "aviso": "No se encontraron vuelos para esta ruta.",
        "vuelos": []
    }


async def _buscar(origen, destino, fecha_salida, fecha_regreso, pasajeros):
    params = {
        "origin":      origen,
        "destination": destino,
        "token":       settings.travelpayouts_token,
        "currency":    "USD",
        "sorting":     "price",
        "limit":       10,
    }

    if fecha_salida:
        params["departure_at"] = fecha_salida
    if fecha_regreso:
        params["return_at"] = fecha_regreso

    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.travelpayouts.com/aviasales/v3/prices_for_dates",
            params=params
        )
        data = res.json()

    print("Respuesta API:", data)

    if not data.get("success") or not data.get("data"):
        return {"aviso": None, "vuelos": []}

    vuelos = []
    for v in data["data"]:
        iata   = v.get("airline", "??")
        precio = float(v.get("price", 0))

        vuelos.append({
            "aerolinea":          iata,
            "aerolinea_nombre":   AEROLINEAS.get(iata, iata),
            "logo_url":           logo_aerolinea(iata),
            "salida":             v.get("departure_at", ""),
            "regreso":            v.get("return_at", ""),
            "escalas":            v.get("transfers", 0),
            "precio_por_persona": precio,
            "precio_total":       round(precio * pasajeros, 2),
            "pasajeros":          pasajeros,
            "link_compra":        link_compra(
                                    v.get("link", ""),
                                    settings.travelpayouts_marker
                                  ),
        })

    return {
        "aviso":  None,
        "vuelos": sorted(vuelos, key=lambda x: x["precio_por_persona"])
    }