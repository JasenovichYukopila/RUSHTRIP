# api/routes/airports.py
from fastapi import APIRouter, HTTPException, Query
from services.airports import buscar_aeropuerto

router = APIRouter(
    prefix="/airports", 
    tags=["Aeropuertos"],
    responses={422: {"description": "Error de validación"}}
)

@router.get(
    "/",
    summary="Buscar aeropuertos y ciudades",
    description="""
    Busca aeropuertos y ciudades por nombre o código parcial.
    
    - **q**: Término de búsqueda (mínimo 2 caracteres)
    
    Devuelve una lista de coincidencias con nombre, país y código IATA.
    Utiliza el autocompletado público de TravelPayouts.
    """,
    response_description="Lista de aeropuertos/ciudades que coinciden con la búsqueda"
)
async def search_airports(
    q: str = Query(..., min_length=2, description="Término de búsqueda para aeropuertos o ciudades")
):
    """
    Endpoint para buscar aeropuertos y ciudades por nombre.
    
    Args:
        q: Término de búsqueda (mínimo 2 caracteres)
        
    Returns:
        Lista de diccionarios con 'nombre', 'pais' y 'codigo'
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=422,
            detail="El término de búsqueda debe tener al menos 2 caracteres"
        )
    
    resultados = await buscar_aeropuerto(q.strip())
    return resultados