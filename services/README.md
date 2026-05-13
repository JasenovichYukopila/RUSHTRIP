# Services

Este directorio contiene la lógica de negocio de RushTrip, organizando los servicios por dominio funcional.

## Estructura

```
services/
├── __init__.py     # Paquete
├── airports.py     # Búsqueda de aeropuertos/ciudades
├── cars.py        # Alquiler de coches
├── flights.py     # Búsqueda de vuelos
├── hotels.py      # Búsqueda de hoteles
└── plan.py        # Generación de planes de viaje
```

## Descripción de Módulos

### airports.py
Busca aeropuertos y ciudades por nombre usando el autocomplete público de Travelpayouts.

**Función principal:**
- `buscar_aeropuerto(texto)` → Devuelve lista de ciudades con código IATA

**Características:**
- API pública (no requiere autenticación)
- Cache en memoria de 1 hora
- Búsqueda en español

---

### cars.py
Busca opciones de alquiler de coches via RapidAPI (Booking.com).

**Función principal:**
- `buscar_coches(iata, pickup_date, dropoff_date, ...)` → Devuelve lista de coches

**Fuentes de datos:**
1. **Primary:** RapidAPI/Booking.com (datos reales)
2. **Fallback:** Precios estimados por ciudad si la API falla

**Coordenadas:** Incluye coordenadas de 40+ ciudades para la búsqueda

---

### flights.py
Busca vuelos usando Travelpayouts API con estrategia de fallback en 3 niveles.

**Función principal:**
- `buscar_vuelos(origen, destino, fecha_salida, fecha_regreso, pasajeros)` → Devuelve lista de vuelos

**Estrategia de búsqueda:**
1. **Nivel 1:** Fecha exacta → Mejor precisión
2. **Nivel 2:** Mes completo → Más cobertura
3. **Nivel 3:** Sin fecha → Próximos disponibles

**Incluye:**
- Mapeo de 15+ aerolineas con descripciones
- URLs de logos de aerolineas
- Links de compra con afiliación

---

### hotels.py
Busca hoteles con fallback doble: RapidAPI → Travelpayouts → estimado.

**Función principal:**
- `buscar_hoteles(ciudad, checkin, checkout, adultos, estrellas_min, estrellas_max)` → Devuelve lista de hoteles

**Fuentes de datos:**
1. **Primary:** RapidAPI/Booking.com (datos reales)
2. **Fallback 1:** Travelpayouts (hotel estimado)
3. **Fallback 2:** Respuesta vacía

**Funciones auxiliares:**
- `_calcular_noches(checkin, checkout)` → Calcula noches
- `_precio_referencia(ciudad)` → Precio promedio por noche

---

### plan.py
Genera planes de viaje optimizados combinando vuelos, hoteles y coches.

**Función principal:**
- `generar_plan(origen, destino, fecha_salida, fecha_regreso, presupuesto, ...)` → Devuelve plan óptimo

**Proceso:**
1. Busca vuelos disponibles
2. Busca hoteles reales
3. Busca coches (opcional)
4. Filtra por tier (economico/estandar/premium)
5. Calcula planes para cada vuelo
6. Empareja con mejores hoteles
7. Selecciona plan óptimo (más caro dentro del presupuesto)

**Tiers de calidad:**
- `economico`: Hoteles 1-3 estrellas, todas las aerolineas
- `estandar`: Hoteles 3-4 estrellas, todas las aerolineas
- `premium`: Hoteles 4-5 estrellas, excluye low-cost (Spirit, Arajet, Viva, Easyfly)

**Mapeo IATA → Ciudad:** 30+ ciudades principal