# core/config.py
# Configuración centralizada usando Pydantic Settings
# Lee variables de entorno desde el archivo .env

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración de la aplicación extraída del archivo .env.

    Attributes:
        travelpayouts_token: Token de autenticación para Travelpayouts API
        travelpayouts_marker: ID de afiliado para tracked links de Travelpayouts
        rapidapi_key: API key para acceder a RapidAPI (Booking.com)
        rapidapi_host: Host de RapidAPI para llamadas a Booking.com
        cors_origins: Lista de orígenes permitidos para CORS (separados por coma)
        debug: Modo debug para desarrollo
    """
    # Tokens para APIs externas
    travelpayouts_token:  str = ""      # Token para API de vuelos
    travelpayouts_marker: str = ""     # Marker de afiliado para Travelpayouts

    # RapidAPI (usado para hoteles y coches via Booking.com)
    rapidapi_key:         str = ""     # API key de RapidAPI
    rapidapi_host:        str = "booking-com15.p.rapidapi.com"  # Host fijo de RapidAPI

    # Configuración de servidor
    cors_origins:         str = "*"    # Orígenes CORS (default: todos)
    debug:                bool = True  # Modo debug


# Instancia global de configuración
# Se carga automáticamente desde .env al importar
settings = Settings()