# core/config.py
# Este archivo lee las credenciales del .env
# y las hace disponibles en toda la app

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    travelpayouts_token:  str = ""
    travelpayouts_marker: str = ""

    class Config:
        env_file = ".env"

# Esta variable la importamos en cualquier archivo que necesite las credenciales
settings = Settings()