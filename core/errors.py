# core/errors.py
# Clases de error estructuradas para toda la aplicacion
# Permite al frontend distinguir tipos de error sin parsear strings

class AppError(Exception):
    """Error base de la aplicacion."""
    def __init__(self, message: str, code: str = "internal_error"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ExternalAPIError(AppError):
    """Error al comunicarse con una API externa (RapidAPI, Travelpayouts, etc.)."""
    def __init__(self, message: str, provider: str = "", status_code: int | None = None):
        self.provider = provider
        self.status_code = status_code
        super().__init__(message, code="external_api_error")


class NoResultsError(AppError):
    """No se encontraron resultados para la busqueda solicitada."""
    def __init__(self, message: str = "No se encontraron resultados"):
        super().__init__(message, code="no_results")


class ValidationError(AppError):
    """Error de validacion en los parametros de entrada."""
    def __init__(self, message: str, field: str = ""):
        self.field = field
        super().__init__(message, code="validation_error")


class RateLimitError(AppError):
    """Se excedio el limite de requests permitidos."""
    def __init__(self, message: str = "Demasiadas solicitudes. Intente nuevamente en un momento."):
        super().__init__(message, code="rate_limit")
