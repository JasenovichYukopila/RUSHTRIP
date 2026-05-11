from fastapi import APIRouter, HTTPException
from services.cars import buscar_coches

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
    if len(ciudad) < 3:
        raise HTTPException(
            status_code=422,
            detail="El código IATA debe tener al menos 3 caracteres."
        )

    resultado = await buscar_coches(
        ciudad, pickup_date, dropoff_date,
        pickup_time, dropoff_time, driver_age, currency
    )
    return resultado
