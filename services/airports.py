# services/airports.py
# Busca aeropuertos y ciudades por nombre
# No necesita API key — es pública de Travelpayouts

import httpx

async def buscar_aeropuerto(texto: str) -> list[dict]:
    """
    Recibe lo que el usuario escribe, ej: "Carta"
    Devuelve lista de ciudades/aeropuertos con su código IATA
    """
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://autocomplete.travelpayouts.com/places2",
            params={
                "term":   texto,
                "locale": "es",
                "types":  "city",
            }
        )
        datos = res.json()

    resultados = []
    for lugar in datos:
        resultados.append({
            "nombre": lugar.get("name"),
            "pais":   lugar.get("country_name"),
            "codigo": lugar.get("code"),
        })

    return resultados