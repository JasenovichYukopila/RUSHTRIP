# core/config.py
# Este archivo lee las credenciales del .env
# y las hace disponibles en toda la app

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    travelpayouts_token:  str = ""
    travelpayouts_marker: str = ""
    rapidapi_key:         str = ""
    rapidapi_host:        str = "booking-com15.p.rapidapi.com"

    model_config = SettingsConfigDict(env_file = ".env")

# Esta variable la importamos en cualquier archivo que necesite las credenciales
settings = Settings()