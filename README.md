# RushTrip ✈️

**Planificador de viajes inteligente por presupuesto.**

Dale un presupuesto total y tus fechas, y RushTrip encuentra la mejor combinación de vuelo + hotel + auto que se ajusta a tu bolsillo.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Frontend | React 18, Vite, Tailwind CSS |
| APIs externas | Travelpayouts (Aviasales), RapidAPI (Booking.com), Booking.com |

---

## Funcionalidades

- **Plan por presupuesto** — Ingresás origen, destino, fechas y cuánto querés gastar. RushTrip busca vuelos, los combina con hoteles reales y te dice cuál es la mejor opción.
- **Búsqueda de vuelos** — Consulta precios en Travelpayouts con fallback inteligente: si no hay vuelos en la fecha exacta, busca en todo el mes, y si tampoco, muestra los próximos disponibles.
- **Hoteles con fotos y precios reales** — Via RapidAPI (Booking.com). Si la API no responde, cae a Travelpayouts con precio estimado.
- **Alquiler de coches** — Via RapidAPI (Booking.com) con fallback a precios estimados por destino.
- **Autocomplete de aeropuertos** — Buscá ciudades y aeropuertos por nombre.
- **Frontend responsive** — Interfaz moderna hecha en React + Tailwind con cards, badges y diseño limpio.

---

## Estructura del proyecto

```
RUSHTRIP/
├── api/
│   └── routes/
│       ├── airports.py    # GET /airports/?q=...
│       ├── cars.py        # GET /cars/?ciudad=...
│       ├── flights.py     # GET /flights/?origen=...&destino=...
│       ├── hotels.py      # GET /hotels/?ciudad=...&checkin=...&checkout=...
│       └── plan.py        # POST /plan/  ← endpoint principal
├── core/
│   ├── config.py          # Settings con variables de entorno
│   ├── http.py            # Cliente HTTP reutilizable
│   ├── cache.py           # Utilidades de caché
│   └── logging.py         # Configuración de Loguru
├── services/
│   ├── flights.py         # Búsqueda de vuelos (Travelpayouts)
│   ├── hotels.py          # Hoteles: RapidAPI → Travelpayouts (fallback)
│   ├── cars.py            # Coches: RapidAPI → precios estimados (fallback)
│   ├── airports.py        # Autocomplete de aeropuertos
│   └── plan.py            # Generador de plan de viaje
├── frontend/
│   └── src/
│       ├── api/client.js      # Cliente Axios con proxy a backend
│       ├── components/        # Componentes React
│       │   ├── PlanResult.jsx
│       │   ├── FlightCard.jsx
│       │   ├── HotelCard.jsx
│       │   ├── CarCard.jsx
│       │   ├── PlanForm.jsx
│       │   └── ...
│       └── pages/
│           ├── Landing.jsx
│           └── Plan.jsx
├── main.py              # Entry point FastAPI
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

Endpoint principal. Recibe origen, destino, fechas y presupuesto; devuelve el mejor plan disponible.

**Request:**
```json
{
  "origen": "BOG",
  "destino": "MIA",
  "fecha_salida": "2026-12-15",
  "fecha_regreso": "2026-12-22",
  "presupuesto": 800,
  "pasajeros": 1
}
```

**Response:**
```json
{
  "plan_optimo": { "vuelo": {...}, "hotel": {...}, "total": 750.00, "dentro_presupuesto": true },
  "alternativas": [...],
  "hoteles": [...],
  "coches": { "coches": [...], "aviso": "..." },
  "aviso": null,
  "precision": "exacta"
}
```

### `GET /flights/` — Buscar vuelos

`/flights/?origen=BOG&destino=MIA&fecha_salida=2026-12-15&fecha_regreso=2026-12-22&pasajeros=1`

### `GET /hotels/` — Buscar hoteles

`/hotels/?ciudad=Miami&checkin=2026-12-15&checkout=2026-12-20&adultos=2`

### `GET /cars/` — Buscar alquiler de coches

`/cars/?ciudad=MIA&pickup_date=2026-12-15&dropoff_date=2026-12-22`

### `GET /airports/` — Autocomplete de aeropuertos

`/airports/?q=Mad`

---

## Cómo funciona el planificador

1. **Busca vuelos** — Consulta Travelpayouts para la ruta y fechas dadas.
2. **Busca hoteles** — Primero intenta RapidAPI (Booking.com) con fotos y precios reales. Si falla, usa Travelpayouts con precios estimados por destino.
3. **Empareja hotel-plan** — Para cada vuelo, calcula el presupuesto restante y asigna el mejor hotel real que entre en ese monto.
4. **Selecciona óptimo** — Elige el plan cuyo costo total se acerque más al presupuesto sin superarlo. Si ninguno cabe, muestra el más barato disponible.
5. **Busca coches** — Agrega opciones de alquiler en el destino.

### Estrategia de fallback

| Servicio | Primario | Fallback |
|----------|----------|----------|
| Vuelos | Travelpayouts (fecha exacta) | Travelpayouts (mes) → Travelpayouts (sin fecha) |
| Hoteles | RapidAPI (Booking.com) | Travelpayouts (precio estimado) |
| Coches | RapidAPI (Booking.com) | Precios estimados por destino |

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
