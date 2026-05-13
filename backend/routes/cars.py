# backend/routes/cars.py
# API endpoint para búsqueda de alquiler de coches
# Valida código IATA y delega al servicio de cars

from fastapi import APIRouter, HTTPException
from services.cars import buscar_coches

# Router para endpoints de coches
# Prefix: /cars
# Tags: Coches (para documentación OpenAPI)
router = APIRouter(
    prefix="/cars",
    tags=["Coches"],
    responses={422: {"description": "Error de validación"}}
)


@router.get(
    "/",
    summary="Buscar alquiler de coches",
    description="""
    Busca opciones de alquiler de coches en una ciudad.

    - **ciudad**: Código IATA de la ciudad destino (ej: MIA, BOG, MAD)
    - **pickup_time**: Hora de recogida (opcional, default: 10:00)
    - **dropoff_time**: Hora de devolución (opcional, default: 10:00)
    - **driver_age**: Edad del conductor (opcional, default: 30)
    - **currency**: Moneda (opcional, default: USD)

    Utiliza la API de Booking.com a través de RapidAPI.
    """,
    response_description="Lista de opciones de alquiler de coches disponibles"
)
async def search_cars(
    ciudad: str,
    pickup_date: str | None = None,
    dropoff_date: str | None = None,
    pickup_time: str = "10:00",
    dropoff_time: str = "10:00",
    driver_age: int = 30,
    currency: str = "USD",
):
    """
    Endpoint para buscar alquiler de coches en una ciudad.

    Args:
        ciudad: Código IATA de la ciudad de recogida/devolución
        pickup_date: Fecha de recogida (YYYY-MM-DD, opcional)
        dropoff_date: Fecha de devolución (YYYY-MM-DD, opcional)
        pickup_time: Hora de recogida (HH:MM)
        dropoff_time: Hora de devolución (HH:MM)
        driver_age: Edad del conductor principal
        currency: Moneda del precio (USD, EUR, etc.)

    Returns:
        Dict con 'ciudad', 'coches' (lista) y 'aviso'

    Raises:
        HTTPException 422: Si el código IATA es muy corto
    """
    # Validar que el código IATA tenga al menos 3 caracteres
    if len(ciudad) < 3:
        raise HTTPException(
            status_code=422,
            detail="El código IATA debe tener al menos 3 caracteres."
        )

    # Delegar al servicio de cars
    resultado = await buscar_coches(
        ciudad, pickup_date, dropoff_date,
        pickup_time, dropoff_time, driver_age, currency
    )
    return resultado