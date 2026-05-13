# core/logging.py
# Configuración de logging usando Loguru
# Proporciona logs formateados a consola y archivo

import logging
import sys
from loguru import logger


def setup_logging():
    """
    Configura el logging para toda la aplicación.

    Incluye:
    - Handler de consola con formato colorido
    - Handler de archivo con rotación (10MB) y retención (1 semana)
    - Interceptor para redirigir logging estándar a Loguru

    Llamar esta función al inicio de la aplicación para activar los logs.
    """
    # Remover handlers por defecto de Loguru
    logger.remove()

    # Handler para consola (stdout) con formato bonito y colores
    # Verde para timestamp, cian para nombre/función/línea, color por nivel
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"  # Solo mostrar INFO y superiores en consola
    )

    # Handler para archivo con rotación y retención
    # Rotación: nuevo archivo cada 10MB
    # Retención: mantener archivos de la última semana
    logger.add(
        "rushtrip.log",
        rotation="10 MB",
        retention="1 week",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG"  # Guardar todo incluyendo DEBUG en archivo
    )

    # Interceptor para capturar logs del módulo estándar logging
    # Redirige todo logging.std a Loguru para unificar la salida
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            try:
                # Convertir nivel de logging a nombre Loguru
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno

            # Encontrar el frame real del llamador (saltar archivos de logging)
            frame, depth = logging.currentframe(), 2
            while frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1

            # Loguear con profundidad correcta para mostrar archivo origina
            logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

    # Configurar logging estándar para usar nuestro interceptor
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)