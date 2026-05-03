# main.py
from fastapi import FastAPI
from api.routes.airports import router as airports_router
from api.routes.flights  import router as flights_router
from api.routes.hotels   import router as hotels_router

app = FastAPI(
    title="RushTrip API",
    description="Planificador de viajes con IA",
    version="1.0.0"
)

app.include_router(airports_router)
app.include_router(flights_router)
app.include_router(hotels_router)

@app.get("/")
async def root():
    return {"status": "ok", "mensaje": "RushTrip API funcionando"}