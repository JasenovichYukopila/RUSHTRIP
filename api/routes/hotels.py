# api/routes/hotels.py
from fastapi import APIRouter, HTTPException
from services.hotels import buscar_hoteles
from datetime import datetime

router = APIRouter(
    prefix="/hotels", 
    tags=["Hoteles"],
    responses={422: {"description": "Error de validación"}}
)

@router.get(
    "/",
    summary="Buscar hoteles",
    description="""
    Busca hoteles disponibles en una ciudad para las fechas especificadas.
    
    - **ciudad**: Nombre de la ciudad (ej: Miami, Bogotá, París)
    - **checkin**: Fecha de entrada en formato YYYY-MM-DD
    - **checkout**: Fecha de salida en formato YYYY-MM-DD
    - **adultos**: Número de adultos (opcional, default: 2)
    
    El endpoint primero busca el ID de la ciudad en Hotellook y luego consulta
    los hoteles disponibles con sus precios y enlaces de reserva.
    """,
    response_description="Lista de hoteles encontrados con precios y enlaces de reserva"
)
async def search_hotels(
    ciudad: str,
    checkin: str,
    checkout: str,
    adultos: int = 2,
):
    """
    Endpoint para buscar hoteles en una ciudad específica.
    """
    # Validar formato de fecha
    try:
        f1 = datetime.strptime(checkin, "%Y-%m-%d")
        f2 = datetime.strptime(checkout, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=422, 
            detail="Formato de fecha incorrecto. Usa YYYY-MM-DD"
        )

    if f2 <= f1:
        raise HTTPException(
            status_code=422, 
            detail="El checkout debe ser posterior al checkin"
        )

    resultado = await buscar_hoteles(ciudad, checkin, checkout, adultos)
    return resultado