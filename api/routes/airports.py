# api/routes/airports.py
# Define el endpoint que el frontend va a consumir

from fastapi import APIRouter
from services.airports import buscar_aeropuerto

router = APIRouter(prefix="/airports", tags=["Aeropuertos"])

@router.get("/")
async def search_airports(q: str):
    """
    q = lo que escribe el usuario
    Ejemplo: /airports/?q=Carta
    """
    resultados = await buscar_aeropuerto(q)
    return resultados