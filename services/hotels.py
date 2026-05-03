# services/hotels.py
import httpx
from core.config import settings


async def buscar_ciudad_id(ciudad: str) -> tuple[int, str] | tuple[None, None]:
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://yasen.hotellook.com/autocomplete",
            params={
                "term":  ciudad,
                "lang":  "es",
                "token": settings.travelpayouts_token,
            }
        )
        print("Status lookup:", res.status_code)
        print("Respuesta lookup:", res.text)

        if res.status_code != 200 or not res.text:
            return None, None

        data = res.json()

    if isinstance(data, list) and data:
        return data[0].get("id"), data[0].get("name")
    elif isinstance(data, dict):
        ciudades = data.get("cities", [])
        if ciudades:
            return ciudades[0]["id"], ciudades[0]["name"]

    return None, None


async def buscar_hoteles(
    ciudad: str,
    checkin: str,
    checkout: str,
    adultos: int = 2,
) -> dict:
    ciudad_id, ciudad_nombre = await buscar_ciudad_id(ciudad)

    if not ciudad_id:
        return {"aviso": f"Ciudad '{ciudad}' no encontrada.", "hoteles": []}

    from datetime import date
    noches = (date.fromisoformat(checkout) - date.fromisoformat(checkin)).days or 1

    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.get(
            "https://engine.hotellook.com/api/v2/cache.json",
            params={
                "location": ciudad_id,
                "checkIn":  checkin,
                "checkOut": checkout,
                "adults":   adultos,
                "currency": "USD",
                "token":    settings.travelpayouts_token,
                "limit":    10,
            }
        )
        data = res.json()

    print("Respuesta Hotellook:", data)

    if not data:
        return {"aviso": "No se encontraron hoteles.", "hoteles": []}

    hoteles = []
    for h in data:
        precio_noche = float(h.get("priceFrom", 0))
        precio_total = round(precio_noche * noches, 2)

        hotel_id = h.get("id", "")
        link = (
            f"https://search.hotellook.com/hotels?destination={ciudad_id}"
            f"&hotelId={hotel_id}&checkIn={checkin}&checkOut={checkout}"
            f"&adults={adultos}&marker={settings.travelpayouts_marker}"
        )

        hoteles.append({
            "nombre":       h.get("name", "Hotel"),
            "estrellas":    h.get("stars", 0),
            "rating":       h.get("guestScore", 0),
            "foto_url":     h.get("photoUrl", ""),
            "precio_noche": precio_noche,
            "precio_total": precio_total,
            "noches":       noches,
            "adultos":      adultos,
            "moneda":       "USD",
            "link_reserva": link,
            "por_que":      "",
        })

    return {
        "aviso":   None,
        "ciudad":  ciudad_nombre,
        "hoteles": sorted(hoteles, key=lambda x: x["precio_total"])
    }