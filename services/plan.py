# services/plan.py
# Servicio de generación de planes de viaje optimizados por presupuesto
# Combina búsquedas de vuelos, hoteles y coches para crear el mejor plan

import logging
from core.config import settings
from services.flights import buscar_vuelos
from services.hotels  import buscar_hoteles, _calcular_noches
from services.cars    import buscar_coches

logger = logging.getLogger(__name__)

# Mapeo IATA → nombre de ciudad para buscar hoteles
# Necesario porque la API de hoteles busca por nombre de ciudad, no por IATA
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
# Usado para estimar costos de hotel cuando no hay datos reales
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


# Configuración de tiers para diferentes presupuestos
# Cada tier tiene filtros específicos para hoteles y airlines
TIER_CONFIG = {
    # Viaje económico: hoteles básicos, todas las aerolineas
    "economico":  {"estrellas_min": 1, "estrellas_max": 3, "aerolineas_excluir": [],            "coche_orden": "asc"},
    # Viaje estándar: hoteles de 3-4 estrellas, todas las aerolineas
    "estandar":   {"estrellas_min": 3, "estrellas_max": 4, "aerolineas_excluir": [],            "coche_orden": "asc"},
    # Viaje premium: hoteles de 4-5 estrellas, excluye low-cost
    "premium":    {"estrellas_min": 4, "estrellas_max": 5, "aerolineas_excluir": ["NK", "DM", "VH", "P5"], "coche_orden": "desc"},
}


def _ciudad_desde_iata(iata: str) -> str:
    """Convierte código IATA al nombre de ciudad para buscar hoteles."""
    return IATA_A_CIUDAD.get(iata.upper(), iata)


def _precio_hotel_estimado(iata_destino: str) -> float:
    """Obtiene el precio de referencia por noche para un destino."""
    return PRECIO_REFERENCIA_HOTEL.get(
        iata_destino.upper(),
        PRECIO_REFERENCIA_HOTEL["_default"]
    )


def _armar_plan(
    vuelo: dict, noches: int, destino: str, presupuesto: float, pasajeros: int,
    ciudad_nombre: str = "", checkin: str = "", checkout: str = "",
    coches: list | None = None, coche_orden: str = "asc",
    incluir_hotel: bool = True,
) -> dict:
    """
    Construye un plan de viaje combinando vuelo, hotel y opcionalmente coche.

    Args:
        vuelo: Datos del vuelo seleccionado
        noches: Número de noches de estancia
        destino: Código IATA del destino
        presupuesto: Presupuesto total del viaje
        pasajeros: Número de pasajeros
        ciudad_nombre: Nombre legible de la ciudad
        checkin: Fecha de entrada
        checkout: Fecha de salida
        coches: Lista de coches disponibles (opcional)
        coche_orden: Orden para seleccionar coche ('asc' o 'desc')
        incluir_hotel: Si True, incluye costo de hotel

    Returns:
        Dict con el plan completo incluyendo vuelo, hotel, coche y totales
    """
    precio_vuelo = vuelo["precio_total"]

    # Calcular costo de hotel si está habilitado
    if incluir_hotel:
        precio_noche = _precio_hotel_estimado(destino)
        costo_hotel  = round(precio_noche * noches, 2)
    else:
        precio_noche = 0
        costo_hotel  = 0

    # Calcular total y verificar si está dentro del presupuesto
    costo_total  = round(precio_vuelo + costo_hotel, 2)
    dentro       = costo_total <= presupuesto

    # Generar link de búsqueda de hoteles
    link_buscar = (
        f"https://search.hotellook.com/hotels?destination={ciudad_nombre}"
        f"&checkIn={checkin}&checkOut={checkout}"
        f"&adults={pasajeros}&marker={settings.travelpayouts_marker}"
    ) if (ciudad_nombre and incluir_hotel) else ""

    # Construir estructura del plan
    plan = {
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

    # Añadir coche si está disponible y es requested
    if coches:
        usado = precio_vuelo + costo_hotel
        restante = presupuesto - usado

        # Seleccionar el coche más caro que quepa en el presupuesto restante
        candidatos = [c for c in coches if c.get("precio_total", 0) <= restante]
        if candidatos:
            coche = max(candidatos, key=lambda c: c.get("precio_total", 0))
        else:
            # Si ninguno cabe, tomar el más barato y marcarlo
            coche = min(coches, key=lambda c: c.get("precio_total", 0))
            coche["fuera_presupuesto"] = True

        plan["coche"] = coche
        plan["total"] = round(costo_total + coche.get("precio_total", 0), 2)
        plan["dentro_presupuesto"] = plan["total"] <= presupuesto

    return plan


def _emparejar_hotel(plan: dict, hoteles: list, presupuesto: float) -> None:
    """
    Reemplaza el hotel estimado por el mejor hotel real disponible
    dentro del presupuesto restante después del vuelo.

    Modifica el plan in-place.

    Args:
        plan: Plan de viaje a modificar
        hoteles: Lista de hoteles reales disponibles
        presupuesto: Presupuesto total del viaje
    """
    costo_vuelo = plan["vuelo"]["precio_total"]
    restante = presupuesto - costo_vuelo

    if not hoteles:
        # No hay hoteles reales, mantener estimado
        plan["hotel"]["tipo"] = "estimado"
        return

    # Buscar hoteles que quepan en el presupuesto restante
    candidatos = [h for h in hoteles if h.get("precio_total", 0) <= restante]
    if not candidatos:
        # Si ninguno cabe, usar el más barato de todos
        candidatos = sorted(hoteles, key=lambda h: h.get("precio_total", 0))

    # Tomar el primero (más económico de los candidatos)
    mejor = candidatos[0]
    plan["hotel"] = {**mejor, "tipo": "recomendado"}
    plan["total"] = round(costo_vuelo + mejor["precio_total"], 2)
    plan["dentro_presupuesto"] = plan["total"] <= presupuesto


async def generar_plan(
    origen:          str,
    destino:         str,
    fecha_salida:    str,
    fecha_regreso:   str,
    presupuesto:     float,
    pasajeros:       int = 1,
    incluir_hotel:   bool = True,
    incluir_vehiculo: bool = False,
    tier:            str = "estandar",
) -> dict:
    """
    Genera un plan de viaje optimizado para el presupuesto dado.

    El proceso:
      1. Busca vuelos disponibles (con fallback en 3 niveles)
      2. Busca hoteles reales si incluir_hotel=True
      3. Busca alquiler de coches si incluir_vehiculo=True
      4. Filtra según tier (excluye low-cost en premium)
      5. Calcula planes para cada vuelo
      6. Empareja cada plan con el mejor hotel disponible
      7. Selecciona el plan óptimo (más caro dentro del presupuesto)

    Args:
        origen: Código IATA del aeropuerto de origen
        destino: Código IATA del aeropuerto de destino
        fecha_salida: Fecha de salida (YYYY-MM-DD)
        fecha_regreso: Fecha de regreso (YYYY-MM-DD)
        presupuesto: Presupuesto total en USD
        pasajeros: Número de pasajeros (default: 1)
        incluir_hotel: Si True, incluye búsqueda de hoteles (default: True)
        incluir_vehiculo: Si True, incluye búsqueda de coches (default: False)
        tier: Nivel de calidad ('economico', 'estandar', 'premium')

    Returns:
        Dict con plan_optimo, alternativas, hoteles, coches y avisos
    """
    # Calcular noches de estancia
    noches = _calcular_noches(fecha_salida, fecha_regreso)

    # Obtener configuración del tier
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["estandar"])

    # 1. Buscar vuelos (estrategia de 3 niveles ya integrada)
    resultado_vuelos = await buscar_vuelos(
        origen, destino, fecha_salida, fecha_regreso, pasajeros
    )

    # 2. Convertir IATA a nombre de ciudad para hoteles
    ciudad_destino = _ciudad_desde_iata(destino)

    # 2a. Buscar hoteles con filtro de estrellas según tier
    if incluir_hotel:
        resultado_hoteles = await buscar_hoteles(
            ciudad=ciudad_destino,
            checkin=fecha_salida,
            checkout=fecha_regreso,
            adultos=pasajeros,
            estrellas_min=cfg["estrellas_min"],
            estrellas_max=cfg["estrellas_max"],
        )
    else:
        resultado_hoteles = {"hoteles": []}

    # 2b. Buscar alquiler de coches si está habilitado
    if incluir_vehiculo:
        resultado_coches = await buscar_coches(
            iata=destino,
            pickup_date=fecha_salida,
            dropoff_date=fecha_regreso,
        )
    else:
        resultado_coches = {"coches": []}

    # Extraer datos de los resultados
    vuelos       = resultado_vuelos.get("vuelos", [])
    precision    = resultado_vuelos.get("precision", "sin_resultados")
    aviso_vuelos = resultado_vuelos.get("aviso")

    # Normalizar lista de hoteles (puede venir en diferentes formatos)
    hoteles_lista = resultado_hoteles.get("hoteles", []) if isinstance(resultado_hoteles, dict) else resultado_hoteles or []

    # 3. Filtrar vuelos según tier (excluir low-cost para premium)
    excluir = cfg.get("aerolineas_excluir", [])
    if excluir:
        vuelos_premium = [v for v in vuelos if v.get("aerolinea", "") not in excluir]
        if vuelos_premium:
            vuelos = vuelos_premium

    # Si no hay vuelos, devolver respuesta vacía
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

    # 4. Calcular plan para cada vuelo disponible
    coches_lista = resultado_coches.get("coches", []) if isinstance(resultado_coches, dict) else []
    planes = [
        _armar_plan(v, noches, destino, presupuesto, pasajeros, ciudad_destino, fecha_salida, fecha_regreso, coches_lista, cfg["coche_orden"], incluir_hotel)
        for v in vuelos
    ]

    # 5. Emparejar cada plan con el mejor hotel real según presupuesto
    for p in planes:
        _emparejar_hotel(p, hoteles_lista, presupuesto)

    # Separar planes que caben en el presupuesto de los que no
    dentro = [p for p in planes if p["dentro_presupuesto"]]
    fuera  = [p for p in planes if not p["dentro_presupuesto"]]

    # 6. Seleccionar plan óptimo
    if dentro:
        # De los que caben, tomar el más caro (mejor experiencia)
        plan_optimo  = max(dentro, key=lambda p: p["total"])
        alternativas = sorted(
            [p for p in dentro if p != plan_optimo],
            key=lambda p: p["total"],
            reverse=True
        )[:2]  # Máximo 2 alternativas
        aviso = aviso_vuelos
    else:
        # Ninguno cabe en el presupuesto, tomar el más económico
        plan_optimo  = min(fuera, key=lambda p: p["total"])
        alternativas = sorted(
            [p for p in fuera if p != plan_optimo],
            key=lambda p: p["total"]
        )[:2]
        # Generar aviso indicando que ningún plan cabe en el presupuesto
        aviso = (
            f"No encontramos combinación dentro de tu presupuesto de ${presupuesto:.0f}. "
            f"La opción más económica disponible cuesta ${plan_optimo['total']:.0f}."
        )
        if aviso_vuelos:
            aviso = aviso_vuelos + " " + aviso

    # Devolver resultado completo
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