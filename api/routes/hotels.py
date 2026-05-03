# api/routes/hotels.py
from fastapi import APIRouter, HTTPException
from services.hotels import buscar_hoteles
from datetime import datetime

router = APIRouter(prefix="/hotels", tags=["Hoteles"])

@router.get("/")
async def search_hotels(
    ciudad: str,
    checkin: str,
    checkout: str,
    adultos: int = 2,
):
    """
    Ejemplo: /hotels/?ciudad=Miami&checkin=2026-08-10&checkout=2026-08-17&adultos=2
    """
    try:
        f1 = datetime.strptime(checkin, "%Y-%m-%d")
        f2 = datetime.strptime(checkout, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=422, detail="Formato de fecha incorrecto. Usa YYYY-MM-DD")

    if f2 <= f1:
        raise HTTPException(status_code=422, detail="El checkout debe ser posterior al checkin")

    resultado = await buscar_hoteles(ciudad, checkin, checkout, adultos)
    return resultado