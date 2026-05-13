import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from backend.routes.airports import router as airports_router
from backend.routes.flights  import router as flights_router
from backend.routes.hotels   import router as hotels_router
from backend.routes.cars     import router as cars_router
from backend.routes.plan     import router as plan_router
from core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    from core.http import http_client
    yield
    await http_client.aclose()

app = FastAPI(
    lifespan=lifespan,
    title="RushTrip API",
    description="""
    API para planificar viajes ajustados a tu presupuesto.

    Características:
    - Búsqueda de vuelos con fallback inteligente (Aviasales/Travelpayouts)
    - Búsqueda de hoteles con links a Booking.com
    - Alquiler de coches via Booking.com (RapidAPI)
    - Búsqueda de aeropuertos y ciudades
    - Plan de viaje optimizado por presupuesto
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
            "description": "Genera el plan de viaje mas ajustado a tu presupuesto"
        },
        {
            "name":        "Vuelos",
            "description": "Busqueda de vuelos con fallback inteligente por mes"
        },
        {
            "name":        "Hoteles",
            "description": "Busqueda de hoteles con links directos a Booking.com"
        },
        {
            "name":        "Coches",
            "description": "Busqueda de alquiler de coches via Booking.com"
        },
        {
            "name":        "Aeropuertos",
            "description": "Autocomplete de aeropuertos y ciudades"
        },
    ]
)

# ── Stripear prefijo /api para compatibilidad frontend ───────────────────
@app.middleware("http")
async def strip_api_prefix(request: Request, call_next):
    path = request.url.path
    if path.startswith("/api/"):
        request.scope["path"] = path[4:]
    elif path == "/api":
        request.scope["path"] = ""
    return await call_next(request)

# ── CORS ─────────────────────────────────────────────────────────────────
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Rutas API ────────────────────────────────────────────────────────────
app.include_router(plan_router)
app.include_router(airports_router)
app.include_router(flights_router)
app.include_router(hotels_router)
app.include_router(cars_router)

# ── Health check ─────────────────────────────────────────────────────────
@app.get("/health", tags=["Root"])
async def health():
    return {"status": "ok", "app": "RushTrip API", "version": "1.1.0"}

@app.get("/", tags=["Root"])
async def root():
    return {"status": "ok", "app": "RushTrip API", "version": "1.1.0", "docs": "/docs"}

# ── Frontend estatico (solo en desarrollo local) ───────────────────────
import os
from pathlib import Path

STATIC_DIR = Path(__file__).resolve().parent / "frontend" / "dist"
if STATIC_DIR.is_dir() and os.environ.get("VERCEL") is None:
    from fastapi.staticfiles import StaticFiles
    if STATIC_DIR.is_dir():
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            file_path = STATIC_DIR / full_path
            if file_path.is_file():
                return FileResponse(file_path)
            index_path = STATIC_DIR / "index.html"
            if index_path.is_file():
                return FileResponse(index_path, media_type="text/html")
            return JSONResponse({"detail": "Not Found"}, status_code=404)