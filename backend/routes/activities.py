# backend/routes/activities.py
# API endpoint para las mejores actividades del destino
# Valida parámetros y delega al servicio de actividades (OpenTripMap)

import re

from fastapi import APIRouter, HTTPException
from services.activities import obtener_actividades

# Router para endpoints de actividades
# Prefix: /activities
# Tags: Actividades (para documentación OpenAPI)
router = APIRouter(
    prefix="/activities",
    tags=["Actividades"],
    responses={422: {"description": "Error de validación"}}
)


@router.get(
    "/",
    summary="Mejores actividades del destino",
    description="""
    Devuelve las mejores actividades y atracciones de una ciudad.

    - **ciudad**: Nombre de la ciudad (ej: Madrid, Bogotá, Miami)
    - **iata**: Código IATA del aeropuerto de destino (opcional, mejora la resolución)
    - **limite**: Cantidad máxima de actividades (1-20, default 8)

    Con OPENTRIPMAP_API_KEY configurada devuelve puntos de interés reales
    ordenados por relevancia turística (precision 'real'). Sin key, o si la
    API falla, degrada a una selección curada por RushTrip (precision
    'estimada'). Los precios son siempre orientativos por tipo de actividad:
    la reserva y el pago se realizan en sitios externos.
    """,
    response_description="Actividades con categoría, precio orientativo, links de reserva y precision"
)
async def get_activities(
    ciudad: str,
    iata: str | None = None,
    limite: int = 8,
):
    """
    Endpoint para consultar las mejores actividades de un destino.

    Args:
        ciudad: Nombre de la ciudad
        iata: Código IATA del aeropuerto de destino (opcional)
        limite: Cantidad máxima de actividades (1-20)

    Returns:
        Dict con 'ciudad', 'actividades' (lista), 'precision' y 'aviso'

    Raises:
        HTTPException 422: Si la ciudad es inválida, el límite está fuera de
        rango o el IATA no tiene 3 letras
    """
    if len(ciudad.strip()) < 2:
        raise HTTPException(
            status_code=422,
            detail="Indica una ciudad válida (mínimo 2 caracteres)"
        )

    if not 1 <= limite <= 20:
        raise HTTPException(
            status_code=422,
            detail="El límite debe estar entre 1 y 20"
        )

    if iata and not re.fullmatch(r"[A-Za-z]{3}", iata):
        raise HTTPException(
            status_code=422,
            detail="El código IATA debe tener 3 letras"
        )

    # Delegar al servicio (siempre devuelve datos: degrada a selección curada)
    return await obtener_actividades(ciudad, iata=iata, limite=limite)
