# core/logging.py
# Configuración básica de logging para la aplicación

import logging
import sys
from loguru import logger

def setup_logging():
    """Configura el logging para toda la aplicación."""
    # Remover handlers por defecto
    logger.remove()
    
    # Agregar handler para stdout con formato bonito
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    
    # También guardar en archivo
    logger.add(
        "rushtrip.log",
        rotation="10 MB",
        retention="1 week",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG"
    )
    
    # Interceptar logging estándar y redirigirlo a loguru
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            # Obtener correspondiente nivel de loguru si existe
            try:
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno

            # Encontrar el llamador desde dónde originated el mensaje logueado
            frame, depth = logging.currentframe(), 2
            while frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1

            logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)