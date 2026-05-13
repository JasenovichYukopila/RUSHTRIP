# Backend / API Routes

Este directorio contiene los endpoints HTTP de la API usando FastAPI.

## Estructura

```
backend/
├── __init__.py    # Paquete
└── routes/
    ├── __init__.py    # Paquete
    ├── airports.py    # GET /airports
    ├── cars.py        # GET /cars
    ├── flights.py     # GET /flights
    ├── hotels.py      # GET /hotels
    └── plan.py        # POST /plan
```

## Descripción de Endpoints

---

### GET /airports
Busca aeropuertos y ciudades por nombre.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `q` | string | Sí | Término de búsqueda (mín 2 chars) |

**Response:**
```json
[
  {
    "nombre": "Bogotá",
    "pais": "Colombia",
    "codigo": "BOG"
  }
]
```

**Errores:**
- `422` - Término muy corto

**Servicio:** `services.airports.buscar_aeropuerto`

---

### GET /flights
Busca vuelos entre dos ciudades.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `origen` | string | Sí | Código IATA origen (ej: BOG) |
| `destino` | string | Sí | Código IATA destino (ej: MIA) |
| `fecha_salida` | string | Sí | Formato YYYY-MM-DD |
| `fecha_regreso` | string | Sí | Formato YYYY-MM-DD |
| `pasajeros` | int | No | Default: 1 |

**Response:**
```json
{
  "aviso": null,
  "precision": "exacta",
  "vuelos": [
    {
      "aerolinea": "AV",
      "aerolinea_nombre": "Avianca",
      "salida": "2026-12-15T08:00:00",
      "precio_por_persona": 250.00,
      "precio_total": 250.00,
      "escalas_texto": "Directo"
    }
  ]
}
```

**Errores:**
- `422` - Fechas inválidas o rango > 30 días

**Servicio:** `services.flights.buscar_vuelos`

---

### GET /hotels
Busca hoteles en una ciudad.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `ciudad` | string | Sí | Nombre de ciudad |
| `checkin` | string | Sí | Formato YYYY-MM-DD |
| `checkout` | string | Sí | Formato YYYY-MM-DD |
| `adultos` | int | No | Default: 2 |

**Response:**
```json
{
  "aviso": null,
  "ciudad": "Miami",
  "hoteles": [
    {
      "nombre": "Hotel Miami Beach",
      "estrellas": 4,
      "rating": 8.5,
      "precio_noche": 120.00,
      "precio_total": 840.00,
      "link_reserva": "https://www.booking.com/..."
    }
  ]
}
```

**Errores:**
- `422` - Fechas inválidas o checkout <= checkin

**Servicio:** `services.hotels.buscar_hoteles`

---

### GET /cars
Busca opciones de alquiler de coches.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `ciudad` | string | Sí | Código IATA (ej: MIA) |
| `pickup_date` | string | No | Formato YYYY-MM-DD |
| `dropoff_date` | string | No | Formato YYYY-MM-DD |
| `pickup_time` | string | No | Default: "10:00" |
| `dropoff_time` | string | No | Default: "10:00" |
| `driver_age` | int | No | Default: 30 |
| `currency` | string | No | Default: "USD" |

**Response:**
```json
{
  "ciudad": "MIA",
  "aviso": null,
  "coches": [
    {
      "nombre": "Toyota Corolla",
      "tipo": "Compacto",
      "precio_total": 280.00,
      "link_reserva": "https://www.booking.com/..."
    }
  ]
}
```

**Errores:**
- `422` - Código IATA muy corto

**Servicio:** `services.cars.buscar_coches`

---

### POST /plan
Genera plan de viaje optimizado por presupuesto. **Endpoint principal.**

**Request Body:**
```json
{
  "origen": "BOG",
  "destino": "MIA",
  "fecha_salida": "2026-12-15",
  "fecha_regreso": "2026-12-22",
  "presupuesto": 800.00,
  "pasajeros": 1
}
```

**Response:**
```json
{
  "origen": "BOG",
  "destino": "MIA",
  "ciudad_destino": "Miami",
  "fecha_salida": "2026-12-15",
  "fecha_regreso": "2026-12-22",
  "noches": 7,
  "presupuesto": 800.00,
  "plan_optimo": {
    "vuelo": {...},
    "hotel": {...},
    "total": 750.00,
    "dentro_presupuesto": true
  },
  "alternativas": [...],
  "hoteles": [...],
  "coches": {...},
  "precision": "exacta",
  "aviso": null
}
```

**Errores:**
- `422` - Validación de fechas, rango > 30 días, origen == destino

**Servicio:** `services.plan.generar_plan`

---

## Validaciones Comunes

Todos los endpoints aplican validaciones:

1. **Fechas:** Formato YYYY-MM-DD, deben ser válidas
2. **Rango:** Máximo 30 días entre salida y regreso
3. **IATA codes:** 3 caracteres para códigos de aeropuerto
4. **Pasajeros:** Rango 1-9 para el endpoint /plan

## Tags de OpenAPI

Los endpoints están organizados por tags en la documentación:
- `Aeropuertos` - Búsqueda de ciudades/aeropuertos
- `Vuelos` - Búsqueda de vuelos
- `Hoteles` - Búsqueda de hoteles
- `Coches` - Alquiler de vehículos
- `Plan de viaje` - Generación de planes optimizados