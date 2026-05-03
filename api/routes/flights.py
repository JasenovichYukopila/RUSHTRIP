from fastapi import APIRouter, HTTPException
from services.flights import buscar_vuelos
import httpx
from core.config import settings
from datetime import datetime
import re

router = APIRouter(prefix="/flights", tags=["Vuelos"])

@router.get("/")
async def search_flights(
        origen: str,
    destino: str,
    fecha_salida: str,
    fecha_regreso: str,
    pasajeros: int = 1, 
):
    patron = r"^\d{4}-\d{2}-\d{2}$"
    if not re.match(patron, fecha_salida) or not re.match(patron, fecha_regreso):
        raise HTTPException(
            status_code=422,
            detail="Las fechas deben tener formato YYYY-MM-DD. Ej: 2026-05-15"
        )

    salida  = datetime.strptime(fecha_salida, "%Y-%m-%d")
    regreso = datetime.strptime(fecha_regreso, "%Y-%m-%d")

    if regreso <= salida:
        raise HTTPException(status_code=422, detail="La fecha de regreso debe ser posterior a la de salida.")

    if (regreso - salida).days > 30:
        raise HTTPException(status_code=422, detail="El rango entre salida y regreso no puede superar 30 días.")

    vuelos = await buscar_vuelos(origen, destino, fecha_salida, fecha_regreso, pasajeros)
    return vuelos

@router.get("/debug")
async def debug_travelpayouts():
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.travelpayouts.com/aviasales/v3/prices_for_dates",
            params={
                "origin":      "CTG",
                "destination": "MIA",
                "token":       settings.travelpayouts_token,
                "currency":    "USD",
                "sorting":     "price",
                "limit":       10,
            }
        )
    return res.json()