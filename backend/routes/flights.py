# backend/routes/flights.py
# API endpoint para búsqueda de vuelos
# Validaciones de fecha y parámetros antes de llamar al servicio

from fastapi import APIRouter, HTTPException
from services.flights import buscar_vuelos
from datetime import datetime
import re

# Router para endpoints de vuelos
# Prefix: /flights
# Tags: Vuelos (para documentación OpenAPI)
router = APIRouter(
    prefix="/flights",
    tags=["Vuelos"],
    responses={422: {"description": "Error de validación"}}
)


@router.get(
    "/",
    summary="Buscar vuelos",
    description="""
    Busca vuelos entre dos ciudades en las fechas especificadas.

    - **origen**: Código IATA del aeropuerto de origen (ej: BOG)
    - **destino**: Código IATA del aeropuerto de destino (ej: MIA)
    - **fecha_salida**: Fecha de salida en formato YYYY-MM-DD
    - **fecha_regreso**: Fecha de regreso en formato YYYY-MM-DD
    - **pasajeros**: Número de pasajeros (opcional, default: 1)

    Si no hay vuelos disponibles en las fechas exactas, busca los más cercanos disponibles.
    """,
    response_description="Lista de vuelos encontrados o mensaje de aviso"
)
async def search_flights(
    origen: str,
    destino: str,
    fecha_salida: str,
    fecha_regreso: str,
    pasajeros: int = 1,
):
    """
    Endpoint para buscar vuelos entre dos ciudades.

    Args:
        origen: Código IATA del aeropuerto de origen
        destino: Código IATA del aeropuerto de destino
        fecha_salida: Fecha de salida (YYYY-MM-DD)
        fecha_regreso: Fecha de regreso (YYYY-MM-DD)
        pasajeros: Número de pasajeros (default: 1)

    Returns:
        Dict con 'aviso', 'vuelos' y 'precision'

    Raises:
        HTTPException 422: Si las fechas son inválidas o el rango es muy largo
    """
    # Validar formato de fecha (YYYY-MM-DD)
    patron = r"^\d{4}-\d{2}-\d{2}$"
    if not re.match(patron, fecha_salida) or not re.match(patron, fecha_regreso):
        raise HTTPException(
            status_code=422,
            detail="Las fechas deben tener formato YYYY-MM-DD. Ej: 2026-05-15"
        )

    # Validar que las fechas sean válidas y coerentes
    try:
        salida  = datetime.strptime(fecha_salida, "%Y-%m-%d")
        regreso = datetime.strptime(fecha_regreso, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Formato de fecha inválido. Use YYYY-MM-DD"
        )

    # Validar que la fecha de regreso sea posterior a la de salida
    if regreso <= salida:
        raise HTTPException(
            status_code=422,
            detail="La fecha de regreso debe ser posterior a la de salida."
        )

    # Validar que el rango no supere 30 días
    if (regreso - salida).days > 30:
        raise HTTPException(
            status_code=422,
            detail="El rango entre salida y regreso no puede superar 30 días."
        )

    # Delegar al servicio de flights
    vuelos = await buscar_vuelos(origen, destino, fecha_salida, fecha_regreso, pasajeros)
    return vuelos