# RushTrip ✈️

**Planificador de viajes inteligente por presupuesto.**

Escribí el nombre de tu ciudad de origen y destino, dale un presupuesto total y RushTrip resuelve automáticamente los aeropuertos, busca vuelos, hoteles y autos, y te presenta la mejor combinación ajustada a tu bolsillo.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.12+, FastAPI, Uvicorn |
| Frontend | React 18, Vite, Tailwind CSS |
| APIs externas | Travelpayouts (Aviasales), RapidAPI (Booking.com), Booking.com |

---

## Funcionalidades

- **Plan por presupuesto** — Escribís el nombre de las ciudades (ej: "Bogotá", "Madrid"), las fechas y tu presupuesto. RushTrip resuelve automáticamente los aeropuertos, busca vuelos, los combina con hoteles reales y te dice cuál es la mejor opción.
- **Resolución automática de aeropuertos** — No necesitás saber códigos IATA. Escribís "Bogotá" y el sistema lo convierte a "BOG" automáticamente. También funciona con códigos IATA si los conocés.
- **Búsqueda de vuelos** — Consulta precios en Travelpayouts con fallback inteligente: si no hay vuelos en la fecha exacta, busca en todo el mes, y si tampoco, muestra los próximos disponibles. Compara conexiones, directos y distintas aerolíneas.
- **Hoteles con fotos y precios reales** — Via RapidAPI (Booking.com). Si la API no responde, cae a Travelpayouts con precio estimado.
- **Alquiler de coches** — Via RapidAPI (Booking.com) con fallback a precios estimados por destino.
- **Comparativa por tiers** — Al ver los resultados, podés comparar opciones Económico, Estándar y Premium para elegir según tu presupuesto.
- **Frontend responsive** — Interfaz moderna hecha en React + Tailwind con cards, badges, diseño limpio y animaciones suaves.

---

## Estructura del proyecto

```
RUSHTRIP/
├── backend/
│   └── routes/
│       ├── airports.py    # GET /airports/?q=...
│       ├── cars.py        # GET /cars/?ciudad=...
│       ├── flights.py     # GET /flights/?origen=...&destino=...
│       ├── hotels.py      # GET /hotels/?ciudad=...&checkin=...&checkout=...
│       └── plan.py        # POST /plan/  ← endpoint principal (acepta nombres de ciudad)
├── core/
│   ├── config.py          # Settings con variables de entorno
│   ├── http.py            # Cliente HTTP reutilizable con retry
│   ├── cache.py           # Utilidades de caché
│   ├── errors.py          # Errores estructurados
│   └── logging.py         # Configuración de Loguru
├── services/
│   ├── flights.py         # Búsqueda de vuelos (Travelpayouts)
│   ├── hotels.py          # Hoteles: RapidAPI → Travelpayouts (fallback)
│   ├── cars.py            # Coches: RapidAPI → precios estimados (fallback)
│   ├── airports.py        # Autocomplete de aeropuertos + aeropuertos alternativos
│   └── plan.py            # Generador de plan de viaje + resolver_iata()
├── frontend/
│   └── src/
│       ├── api/client.js      # Cliente Axios con interceptor de errores
│       ├── components/        # Componentes React
│       │   ├── AirportInput.jsx     # Autocomplete con auto-selección
│       │   ├── PlanForm.jsx         # Formulario progresivo 2 pasos
│       │   ├── PlanResult.jsx       # Resultados con comparativa de tiers
│       │   ├── SummaryCard.jsx      # Resumen del presupuesto
│       │   ├── TierComparison.jsx   # Comparación Económico/Estándar/Premium
│       │   ├── FlightCard.jsx
│       │   ├── HotelCard.jsx
│       │   ├── CarCard.jsx
│       │   └── ...
│       └── pages/
│           ├── Landing.jsx
│           └── Plan.jsx
├── main.py              # Entry point FastAPI (rate limiting, CSP, manejo global de errores)
├── test_api.py          # Tests de integración
└── requirements.txt
```

---

## Quick Start

### 1. Clonar e instalar backend

```bash
git clone https://github.com/JasenovichYukopila/RUSHTRIP.git
cd RUSHTRIP

python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Creá un archivo `.env` en la raíz:

```env
TRAVELPAYOUTS_TOKEN=tu_token
TRAVELPAYOUTS_MARKER=tu_marker
RAPIDAPI_KEY=tu_rapidapi_key
RAPIDAPI_HOST=booking-com15.p.rapidapi.com
```

- **Travelpayouts** — Registrate en [travelpayouts.com](https://travelpayouts.com) y obtené token + marker desde el panel de APIs.
- **RapidAPI** — Suscribite al [plan gratuito de Booking.com API](https://rapidapi.com/DataCrawler/api/booking-com15) y copiá tu API key.

### 3. Iniciar backend

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

La API estará en `http://127.0.0.1:8000`. Documentación interactiva en `http://127.0.0.1:8000/docs`.

### 4. Iniciar frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend arranca en `http://localhost:5173` con proxy automático al backend.

---

## API Endpoints

### `POST /plan/` — Generar plan de viaje

Endpoint principal. Recibe **nombres de ciudad** (o códigos IATA), fechas y presupuesto; resuelve aeropuertos automáticamente y devuelve el mejor plan disponible.

**Request:**
```json
{
  "origen": "Bogotá",
  "destino": "Madrid",
  "fecha_salida": "2026-12-15",
  "fecha_regreso": "2026-12-22",
  "presupuesto": 800,
  "pasajeros": 1,
  "incluir_hotel": true,
  "incluir_vehiculo": false,
  "tier": "estandar"
}
```

**Response:**
```json
{
  "origen": "BOG",
  "destino": "MAD",
  "ciudad_destino": "Madrid",
  "fecha_salida": "2026-12-15",
  "fecha_regreso": "2026-12-22",
  "noches": 7,
  "presupuesto": 800.00,
  "plan_optimo": {
    "vuelo": {...},
    "hotel": {...},
    "coche": {...},
    "total": 750.00,
    "dentro_presupuesto": true
  },
  "alternativas": [...],
  "hoteles": [...],
  "coches": { "coches": [...], "aviso": "..." },
  "aeropuertos_alternativos": [...],
  "aviso": null,
  "precision": "exacta"
}
```

> **Nota:** `origen` y `destino` aceptan nombres de ciudad (ej: "Bogotá", "Miami") o códigos IATA (ej: "BOG", "MIA"). El backend los resuelve automáticamente.

### `GET /flights/` — Buscar vuelos

`/flights/?origen=BOG&destino=MIA&fecha_salida=2026-12-15&fecha_regreso=2026-12-22&pasajeros=1`

> Requiere códigos IATA. Usado internamente por el planificador.

### `GET /hotels/` — Buscar hoteles

`/hotels/?ciudad=Miami&checkin=2026-12-15&checkout=2026-12-20&adultos=2`

### `GET /cars/` — Buscar alquiler de coches

`/cars/?ciudad=MIA&pickup_date=2026-12-15&dropoff_date=2026-12-22`

### `GET /airports/` — Autocomplete de aeropuertos

`/airports/?q=Madrid`

Devuelve aeropuertos/ciudades que coinciden con el término. Usado por el frontend para el autocomplete y por el backend para resolver ciudades a IATA.

---

## Cómo funciona el planificador

1. **Resuelve ciudades a aeropuertos** — El usuario escribe "Bogotá" y "Madrid". El backend usa la API de Travelpayouts para convertirlos a "BOG" y "MAD" automáticamente.
2. **Busca vuelos** — Consulta Travelpayouts para la ruta y fechas dadas. Compara directos, conexiones y distintas aerolíneas.
3. **Busca hoteles** — Primero intenta RapidAPI (Booking.com) con fotos y precios reales. Si falla, usa Travelpayouts con precios estimados por destino.
4. **Empareja hotel-plan** — Para cada vuelo, calcula el presupuesto restante y asigna el mejor hotel real que entre en ese monto.
5. **Selecciona óptimo** — Elige el plan cuyo costo total se acerque más al presupuesto sin superarlo. Si ninguno cabe, muestra el más barato disponible.
6. **Busca coches** — Agrega opciones de alquiler en el destino si queda presupuesto.
7. **Comparativa por tiers** — El frontend muestra opciones Económico, Estándar y Premium para que el usuario elija según su presupuesto.

### Estrategia de fallback

| Servicio | Primario | Fallback |
|----------|----------|----------|
| Vuelos | Travelpayouts (fecha exacta) | Travelpayouts (mes) → Travelpayouts (sin fecha) |
| Hoteles | RapidAPI (Booking.com) | Travelpayouts (precio estimado) |
| Coches | RapidAPI (Booking.com) | Precios estimados por destino |
| Resolución ciudad → IATA | Travelpayouts autocomplete | Cache local |

---

## Despliegue

### Backend (producción)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Recordá actualizar `allow_origins` en `main.py` con tu dominio real.

### Frontend (producción)

```bash
cd frontend
npm run build
# El contenido de frontend/dist/ va a tu CDN o servidor estático
```

---

## Licencia

MIT
