# services/plan.py
import logging
from core.config import settings
from services.flights import buscar_vuelos
from services.hotels  import buscar_hoteles, _calcular_noches
from services.cars    import buscar_coches

logger = logging.getLogger(__name__)

# Mapeo IATA → nombre de ciudad para buscar hoteles
IATA_A_CIUDAD: dict[str, str] = {
    # Colombia
    "BOG": "Bogotá", "MDE": "Medellín", "CLO": "Cali",
    "CTG": "Cartagena", "BAQ": "Barranquilla",
    # LATAM
    "MIA": "Miami", "CUN": "Cancún", "MEX": "Ciudad de México",
    "GDL": "Guadalajara", "LIM": "Lima", "GYE": "Guayaquil",
    "UIO": "Quito", "SCL": "Santiago", "EZE": "Buenos Aires",
    "GRU": "São Paulo", "SDQ": "Santo Domingo", "HAV": "La Habana",
    "PTY": "Panamá", "SJO": "San José",
    # Norte América
    "JFK": "Nueva York", "LAX": "Los Ángeles", "ORD": "Chicago",
    "MCO": "Orlando", "LAS": "Las Vegas", "SFO": "San Francisco",
    "BOS": "Boston", "DCA": "Washington", "ATL": "Atlanta",
    # Europa
    "MAD": "Madrid", "BCN": "Barcelona", "LHR": "Londres",
    "CDG": "París", "FCO": "Roma", "AMS": "Ámsterdam",
    "FRA": "Fráncfort", "LIS": "Lisboa", "VIE": "Viena",
    "ZRH": "Zúrich",
}

# Precio promedio por noche en USD según destino
PRECIO_REFERENCIA_HOTEL: dict[str, float] = {
    "BOG": 45,  "MDE": 50,  "CLO": 40,  "CTG": 70,  "BAQ": 45,
    "MIA": 120, "CUN": 85,  "MEX": 70,  "GDL": 60,  "LIM": 55,
    "GYE": 45,  "UIO": 50,  "SCL": 80,  "EZE": 65,  "GRU": 70,
    "SDQ": 75,  "HAV": 90,  "PTY": 80,  "SJO": 75,
    "JFK": 200, "LAX": 170, "ORD": 140, "MCO": 100, "LAS": 90,
    "SFO": 190, "BOS": 160, "DCA": 150, "ATL": 110,
    "MAD": 90,  "BCN": 100, "LHR": 180, "CDG": 160, "FCO": 130,
    "AMS": 150, "FRA": 130, "LIS": 95,  "VIE": 110, "ZRH": 200,
    "_default": 80,
}


def _ciudad_desde_iata(iata: str) -> str:
    """Convierte código IATA al nombre de ciudad para buscar hoteles."""
    return IATA_A_CIUDAD.get(iata.upper(), iata)


def _precio_hotel_estimado(iata_destino: str) -> float:
    return PRECIO_REFERENCIA_HOTEL.get(
        iata_destino.upper(),
        PRECIO_REFERENCIA_HOTEL["_default"]
    )


def _armar_plan(
    vuelo: dict, noches: int, destino: str, presupuesto: float, pasajeros: int,
    ciudad_nombre: str = "", checkin: str = "", checkout: str = "",
) -> dict:
    precio_vuelo = vuelo["precio_total"]
    precio_noche = _precio_hotel_estimado(destino)
    costo_hotel  = round(precio_noche * noches, 2)
    costo_total  = round(precio_vuelo + costo_hotel, 2)
    dentro       = costo_total <= presupuesto

    link_buscar = (
        f"https://search.hotellook.com/hotels?destination={ciudad_nombre}"
        f"&checkIn={checkin}&checkOut={checkout}"
        f"&adults={pasajeros}&marker={settings.travelpayouts_marker}"
    ) if ciudad_nombre else ""

    return {
        "vuelo": vuelo,
        "hotel": {
            "precio_noche": precio_noche,
            "precio_total": costo_hotel,
            "noches":       noches,
            "criterio":     f"Precio estimado de {precio_noche:.0f} USD/noche para {ciudad_nombre or destino} basado en tarifas promedio de la zona.",
            "link_buscar":  link_buscar,
        },
        "total":              costo_total,
        "presupuesto":        presupuesto,
        "dentro_presupuesto": dentro,
    }


def _emparejar_hotel(plan: dict, hoteles: list, presupuesto: float) -> None:
    """Reemplaza el hotel estimado por el mejor hotel real disponible dentro del presupuesto restante."""
    costo_vuelo = plan["vuelo"]["precio_total"]
    restante = presupuesto - costo_vuelo

    if not hoteles:
        plan["hotel"]["tipo"] = "estimado"
        return

    candidatos = [h for h in hoteles if h.get("precio_total", 0) <= restante]
    if not candidatos:
        candidatos = sorted(hoteles, key=lambda h: h.get("precio_total", 0))

    mejor = candidatos[0]
    plan["hotel"] = {**mejor, "tipo": "recomendado"}
    plan["total"] = round(costo_vuelo + mejor["precio_total"], 2)
    plan["dentro_presupuesto"] = plan["total"] <= presupuesto


async def generar_plan(
    origen:        str,
    destino:       str,
    fecha_salida:  str,
    fecha_regreso: str,
    presupuesto:   float,
    pasajeros:     int = 1,
) -> dict:
    noches = _calcular_noches(fecha_salida, fecha_regreso)

    # 1. Buscar vuelos y hoteles en paralelo
    resultado_vuelos = await buscar_vuelos(
        origen, destino, fecha_salida, fecha_regreso, pasajeros
    )

    # 2. Convertir IATA a nombre de ciudad para hoteles
    ciudad_destino    = _ciudad_desde_iata(destino)
    resultado_hoteles = await buscar_hoteles(
        ciudad=ciudad_destino,
        checkin=fecha_salida,
        checkout=fecha_regreso,
        adultos=pasajeros,
    )

    # 2b. Buscar alquiler de coches en el destino
    resultado_coches = await buscar_coches(
        iata=destino,
        pickup_date=fecha_salida,
        dropoff_date=fecha_regreso,
    )

    vuelos       = resultado_vuelos.get("vuelos", [])
    precision    = resultado_vuelos.get("precision", "sin_resultados")
    aviso_vuelos = resultado_vuelos.get("aviso")

    hoteles_lista = resultado_hoteles.get("hoteles", []) if isinstance(resultado_hoteles, dict) else resultado_hoteles or []

    if not vuelos:
        return {
            "origen":         origen.upper(),
            "destino":        destino.upper(),
            "ciudad_destino": ciudad_destino,
            "fecha_salida":   fecha_salida,
            "fecha_regreso":  fecha_regreso,
            "pasajeros":      pasajeros,
            "noches":         noches,
            "presupuesto":    presupuesto,
            "plan_optimo":    None,
            "alternativas":   [],
            "hoteles":        hoteles_lista,
            "coches":         resultado_coches,
            "aviso":          aviso_vuelos or "No se encontraron vuelos para esta ruta.",
            "precision":      precision,
        }

    # 3. Calcular plan para cada vuelo
    planes = [
        _armar_plan(v, noches, destino, presupuesto, pasajeros, ciudad_destino, fecha_salida, fecha_regreso)
        for v in vuelos
    ]

    # 3b. Emparejar cada plan con el mejor hotel disponible según presupuesto restante
    for p in planes:
        _emparejar_hotel(p, hoteles_lista, presupuesto)

    dentro = [p for p in planes if p["dentro_presupuesto"]]
    fuera  = [p for p in planes if not p["dentro_presupuesto"]]

    # 4. Seleccionar plan óptimo
    if dentro:
        plan_optimo  = max(dentro, key=lambda p: p["total"])
        alternativas = sorted(
            [p for p in dentro if p != plan_optimo],
            key=lambda p: p["total"],
            reverse=True
        )[:2]
        aviso = aviso_vuelos
    else:
        plan_optimo  = min(fuera, key=lambda p: p["total"])
        alternativas = sorted(
            [p for p in fuera if p != plan_optimo],
            key=lambda p: p["total"]
        )[:2]
        aviso = (
            f"No encontramos combinación dentro de tu presupuesto de ${presupuesto:.0f}. "
            f"La opción más económica disponible cuesta ${plan_optimo['total']:.0f}."
        )
        if aviso_vuelos:
            aviso = aviso_vuelos + " " + aviso

    return {
        "origen":         origen.upper(),
        "destino":        destino.upper(),
        "ciudad_destino": ciudad_destino,
        "fecha_salida":   fecha_salida,
        "fecha_regreso":  fecha_regreso,
        "pasajeros":      pasajeros,
        "noches":         noches,
        "presupuesto":    presupuesto,
        "plan_optimo":    plan_optimo,
        "alternativas":   alternativas,
        "hoteles":        hoteles_lista,
        "coches":         resultado_coches,
        "aviso":          aviso,
        "precision":      precision,
    }