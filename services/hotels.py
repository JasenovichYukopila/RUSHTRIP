import httpx
import logging
import re
from datetime import date
from core.config import settings

logger = logging.getLogger(__name__)

_RAPID_HEADERS = {
    "x-rapidapi-key": settings.rapidapi_key,
    "x-rapidapi-host": settings.rapidapi_host,
    "Content-Type": "application/json",
}

PRECIO_REFERENCIA_HOTEL: dict[str, float] = {
    "BOG": 45,  "MDE": 50,  "CLO": 40,  "CTG": 70,  "BAQ": 45,
    "MIA": 120, "MCO": 100, "CUN": 85,  "MEX": 70,  "LIM": 55,
    "JFK": 200, "LAX": 170, "ORD": 140, "LAS": 90,  "MAD": 90,
    "BCN": 100, "LHR": 180, "CDG": 160, "FCO": 130, "AMS": 150,
    "_default": 80,
}


def _calcular_noches(checkin: str, checkout: str) -> int:
    noches = (date.fromisoformat(checkout) - date.fromisoformat(checkin)).days or 1
    return max(noches, 1)


def _precio_referencia(ciudad: str) -> float:
    return PRECIO_REFERENCIA_HOTEL.get(ciudad.upper(), PRECIO_REFERENCIA_HOTEL["_default"])


def _slug_hotel(nombre: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', nombre.lower()).strip('-')


async def _buscar_rapidapi(ciudad: str, checkin: str, checkout: str, adultos: int) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r1 = await c.get(
                "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination",
                params={"query": ciudad},
                headers=_RAPID_HEADERS,
            )
            r1.raise_for_status()
            data1 = r1.json()

        if not data1.get("status"):
            return None

        dests = data1.get("data", [])
        if not dests:
            return None

        dest_id = dests[0].get("dest_id")
        nombre_ciudad = dests[0].get("name") or dests[0].get("city_name", ciudad)
        country_code = dests[0].get("cc1", "")

        async with httpx.AsyncClient(timeout=15.0) as c:
            r2 = await c.get(
                "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels",
                params={
                    "dest_id": dest_id,
                    "search_type": "city",
                    "arrival_date": checkin,
                    "departure_date": checkout,
                    "adults": adultos,
                    "currency_code": "USD",
                },
                headers=_RAPID_HEADERS,
            )
            r2.raise_for_status()
            data2 = r2.json()

        if not data2.get("status"):
            return None

        raw = data2.get("data", {})
        hoteles_raw = raw.get("hotels", [])
        if not isinstance(hoteles_raw, list):
            hoteles_raw = []

        noches = _calcular_noches(checkin, checkout)
        hoteles = []
        for h in hoteles_raw:
            if not isinstance(h, dict):
                continue
            prop = h.get("property", h)

            pb = prop.get("priceBreakdown", {})
            gross = pb.get("grossPrice", {})
            precio_noche = float(gross.get("value", prop.get("price", 0)))
            if not precio_noche:
                precio_noche = float(prop.get("minPrice", 0))

            precio_total = round(precio_noche * noches, 2)
            hotel_id = prop.get("id", h.get("hotel_id", ""))
            hotel_name = prop.get("name", "Hotel")
            fotos = prop.get("photoUrls", [])
            foto_url = fotos[0] if fotos else ""

            slug = _slug_hotel(hotel_name)
            if country_code and slug:
                link = (
                    f"https://www.booking.com/hotel/{country_code}/{slug}.html"
                    f"?checkin={checkin}&checkout={checkout}"
                    f"&group_adults={adultos}&selected_currency=USD"
                )
            else:
                link = (
                    f"https://www.booking.com/searchresults.html?"
                    f"dest_id={dest_id}&dest_type=city&checkin={checkin}"
                    f"&checkout={checkout}&group_adults={adultos}"
                    f"&selected_currency=USD"
                )
                if hotel_id:
                    link += f"&hotel_id={hotel_id}"

            hoteles.append({
                "nombre": hotel_name,
                "estrellas": prop.get("qualityClass", prop.get("accuratePropertyClass", 0)),
                "rating": prop.get("reviewScore", prop.get("reviewCount", 0)),
                "foto_url": foto_url,
                "precio_noche": precio_noche,
                "precio_total": precio_total,
                "noches": noches,
                "adultos": adultos,
                "moneda": prop.get("currency", "USD"),
                "link_reserva": link,
                "por_que": "",
                "tipo": "real",
            })

        return {
            "aviso": None,
            "ciudad": nombre_ciudad or ciudad,
            "hoteles": sorted(hoteles, key=lambda x: x["precio_total"]),
        }
    except Exception as e:
        logger.warning(f"RapidAPI falló para '{ciudad}': {e}")
        return None


async def _buscar_travelpayouts(ciudad: str, checkin: str, checkout: str, adultos: int) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=8.0) as c:
            res = await c.get(
                "https://autocomplete.travelpayouts.com/places2",
                params={"term": ciudad, "locale": "es", "types": "city"},
            )
            res.raise_for_status()
            data = res.json()

        if not data:
            return None

        city = data[0]
        nombre = city.get("name", ciudad)
        codigo = city.get("code", "")
        pais = city.get("country_name", "")

        noches = _calcular_noches(checkin, checkout)
        precio_noche = _precio_referencia(codigo)
        precio_total = round(precio_noche * noches, 2)

        link = (
            f"https://www.booking.com/searchresults.html?"
            f"ss={nombre.replace(' ', '+')}&checkin={checkin}"
            f"&checkout={checkout}&group_adults={adultos}"
            f"&selected_currency=USD"
        )

        return {
            "aviso": None,
            "ciudad": f"{nombre}, {pais}".strip(", "),
            "hoteles": [{
                "nombre": f"Hoteles en {nombre}",
                "estrellas": 3,
                "rating": 0,
                "foto_url": "",
                "precio_noche": precio_noche,
                "precio_total": precio_total,
                "noches": noches,
                "adultos": adultos,
                "moneda": "USD",
                "link_reserva": link,
                "por_que": "Precio estimado basado en tarifas promedio de la zona.",
                "tipo": "estimado",
            }],
        }
    except Exception as e:
        logger.warning(f"Travelpayouts falló para '{ciudad}': {e}")
        return None


async def buscar_hoteles(
    ciudad: str,
    checkin: str,
    checkout: str,
    adultos: int = 2,
) -> dict:
    resultado = await _buscar_rapidapi(ciudad, checkin, checkout, adultos)
    if resultado and resultado.get("hoteles"):
        return resultado

    logger.info(f"Fallback a Travelpayouts para '{ciudad}'")
    resultado = await _buscar_travelpayouts(ciudad, checkin, checkout, adultos)
    if resultado and resultado.get("hoteles"):
        return resultado

    noches = _calcular_noches(checkin, checkout)
    return {
        "aviso": f"No se encontraron hoteles para '{ciudad}'.",
        "ciudad": ciudad,
        "hoteles": [],
    }
