# api/routes/plan.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from services.plan import generar_plan
from datetime import datetime
import re

router = APIRouter(
    prefix="/plan",
    tags=["Plan de viaje"],
    responses={422: {"description": "Error de validación"}}
)


class PlanRequest(BaseModel):
    origen:        str   = Field(..., min_length=3, max_length=3, description="Código IATA origen (ej: BOG)")
    destino:       str   = Field(..., min_length=3, max_length=3, description="Código IATA destino (ej: MIA)")
    fecha_salida:  str   = Field(..., description="Fecha de salida YYYY-MM-DD")
    fecha_regreso: str   = Field(..., description="Fecha de regreso YYYY-MM-DD")
    presupuesto:   float = Field(..., gt=0, description="Presupuesto total en USD")
    pasajeros:     int   = Field(1, ge=1, le=9, description="Número de pasajeros")

    @field_validator("origen", "destino")
    @classmethod
    def iata_upper(cls, v: str) -> str:
        return v.upper().strip()

    @field_validator("fecha_salida", "fecha_regreso")
    @classmethod
    def validar_fecha(cls, v: str) -> str:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("Formato de fecha inválido. Use YYYY-MM-DD")
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Fecha inválida")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "origen":        "BOG",
                "destino":       "MIA",
                "fecha_salida":  "2026-12-15",
                "fecha_regreso": "2026-12-22",
                "presupuesto":   800,
                "pasajeros":     1,
            }
        }
    }


@router.post(
    "/",
    summary="Generar plan de viaje por presupuesto",
    description="""
    Genera el plan de viaje más ajustado a tu presupuesto.

    El sistema busca vuelos disponibles y los combina con el estimado de hotel
    para encontrar la combinación óptima dentro de tu presupuesto total.

    - **origen**: Código IATA de la ciudad de origen (ej: BOG)
    - **destino**: Código IATA de la ciudad de destino (ej: MIA)
    - **fecha_salida**: Fecha de salida en formato YYYY-MM-DD
    - **fecha_regreso**: Fecha de regreso en formato YYYY-MM-DD
    - **presupuesto**: Presupuesto total en USD (vuelo + hotel)
    - **pasajeros**: Número de pasajeros (default: 1)

    Devuelve:
    - **plan_optimo**: La mejor combinación vuelo + hotel dentro del presupuesto
    - **alternativas**: Hasta 2 opciones adicionales para comparar
    - **hoteles**: Links a Booking.com para buscar hoteles en el destino
    - **precision**: Qué tan exactos son los precios (exacta / mes / aproximada)
    - **aviso**: Mensaje informativo si no hay resultados exactos
    """,
    response_description="Plan de viaje optimizado para el presupuesto dado",
)
async def crear_plan(body: PlanRequest):
    """
    Endpoint principal de RushTrip: genera un plan de viaje por presupuesto.
    """
    # Validar que las fechas sean coherentes
    salida  = datetime.strptime(body.fecha_salida,  "%Y-%m-%d")
    regreso = datetime.strptime(body.fecha_regreso, "%Y-%m-%d")

    if regreso <= salida:
        raise HTTPException(
            status_code=422,
            detail="La fecha de regreso debe ser posterior a la de salida."
        )

    if (regreso - salida).days > 30:
        raise HTTPException(
            status_code=422,
            detail="El rango entre salida y regreso no puede superar 30 días."
        )

    if body.origen == body.destino:
        raise HTTPException(
            status_code=422,
            detail="El origen y el destino no pueden ser la misma ciudad."
        )

    resultado = await generar_plan(
        origen=        body.origen,
        destino=       body.destino,
        fecha_salida=  body.fecha_salida,
        fecha_regreso= body.fecha_regreso,
        presupuesto=   body.presupuesto,
        pasajeros=     body.pasajeros,
    )

    return resultado