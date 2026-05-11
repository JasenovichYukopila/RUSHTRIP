# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.airports import router as airports_router
from api.routes.flights  import router as flights_router
from api.routes.hotels   import router as hotels_router
from api.routes.cars     import router as cars_router
from api.routes.plan     import router as plan_router

app = FastAPI(
    title="RushTrip API",
    description="""
    API para planificar viajes ajustados a tu presupuesto.

    Características:
    - 🛫 Búsqueda de vuelos con fallback inteligente (Aviasales/Travelpayouts)
    - 🏨 Búsqueda de hoteles con links a Booking.com
    - 🚗 Alquiler de coches via Booking.com (RapidAPI)
    - 🗺️ Búsqueda de aeropuertos y ciudades
    - 💰 Plan de viaje optimizado por presupuesto
    """,
    version="1.1.0",
    contact={
        "name":  "RushTrip Support",
        "url":   "https://myrushtrip.com/contact",
        "email": "support@myrushtrip.com",
    },
    license_info={
        "name": "MIT License",
        "url":  "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name":        "Plan de viaje",
            "description": "Genera el plan de viaje más ajustado a tu presupuesto"
        },
        {
            "name":        "Vuelos",
            "description": "Búsqueda de vuelos con fallback inteligente por mes"
        },
        {
            "name":        "Hoteles",
            "description": "Búsqueda de hoteles con links directos a Booking.com"
        },
        {
            "name":        "Coches",
            "description": "Búsqueda de alquiler de coches via Booking.com"
        },
        {
            "name":        "Aeropuertos",
            "description": "Autocomplete de aeropuertos y ciudades"
        },
    ]
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Desarrollo: permite cualquier origen con ["*"]
# Producción: reemplaza con tu dominio real, por ejemplo:
# allow_origins=["https://myrushtrip.com", "https://www.myrushtrip.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(plan_router)      # /plan
app.include_router(airports_router)  # /airports
app.include_router(flights_router)   # /flights
app.include_router(hotels_router)    # /hotels
app.include_router(cars_router)      # /cars

@app.get("/", tags=["Root"])
async def root():
    return {
        "status":  "ok",
        "app":     "RushTrip API",
        "version": "1.1.0",
        "docs":    "/docs",
    }