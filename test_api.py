#!/usr/bin/env python3
"""
Script de prueba para verificar que los endpoints de RushTrip API funcionan correctamente.
"""

import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000"

async def test_root():
    """Probar el endpoint raíz."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/")
        print("Endpoint raíz:")
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.json()}")
        print()

async def test_airports():
    """Probar el endpoint de aeropuertos."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/airports/?q=Mad")
        print("Endpoint /airports/:")
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Resultados: {len(data)} aeropuertos encontrados")
            if data:
                print(f"  Primer resultado: {data[0]}")
        else:
            print(f"  Error: {response.text}")
        print()

async def test_flights():
    """Probar el endpoint de vuelos."""
    async with httpx.AsyncClient() as client:
        # Usando fechas de ejemplo (debe ser futuro)
        response = await client.get(
            f"{BASE_URL}/flights/?"
            f"origen=BOG&"
            f"destino=MIA&"
            f"fecha_salida=2026-12-15&"
            f"fecha_regreso=2026-12-22&"
            f"pasajeros=1"
        )
        print("Endpoint /flights/:")
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Aviso: {data.get('aviso', 'Ninguno')}")
            print(f"  Vuelos encontrados: {len(data.get('vuelos', []))}")
            if data.get('vuelos'):
                print(f"  Primer vuelo: {data['vuelos'][0]}")
        else:
            print(f"  Error: {response.text}")
        print()

async def test_cars():
    """Probar el endpoint de alquiler de coches."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/cars/?"
            f"ciudad=MIA&"
            f"pickup_date=2026-12-15&"
            f"dropoff_date=2026-12-22&"
            f"pickup_time=10:00&"
            f"dropoff_time=10:00&"
            f"driver_age=30&"
            f"currency=USD"
        )
        print("Endpoint /cars/:")
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Aviso: {data.get('aviso', 'Ninguno')}")
            print(f"  Coches encontrados: {len(data.get('coches', []))}")
            if data.get('coches'):
                print(f"  Primer coche: {data['coches'][0]}")
        else:
            print(f"  Error: {response.text}")
        print()

async def test_hotels():
    """Probar el endpoint de hoteles."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/hotels/?"
            f"ciudad=Miami&"
            f"checkin=2026-12-15&"
            f"checkout=2026-12-20&"
            f"adultos=2"
        )
        print("Endpoint /hotels/:")
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Aviso: {data.get('aviso', 'Ninguno')}")
            print(f"  Ciudad: {data.get('ciudad', 'No especificada')}")
            print(f"  Hoteles encontrados: {len(data.get('hoteles', []))}")
            if data.get('hoteles'):
                print(f"  Primer hotel: {data['hoteles'][0]}")
        else:
            print(f"  Error: {response.text}")
        print()

async def main():
    """Ejecutar todas las pruebas."""
    print("=== Probando RushTrip API ===\n")
    
    try:
        await test_root()
        await test_airports()
        await test_flights()
        await test_hotels()
        await test_cars()
        print("=== Todas las pruebas completadas ===")
    except Exception as e:
        print(f"Error durante las pruebas: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())