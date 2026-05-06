from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    node_env: str = "development"
    port: int = 8000
    mongodb_uri: str = "mongodb://localhost:27017/fluxpay"
    mongodb_db_name: str = "fluxpay"

    allowed_origins: str = "http://localhost:5173,http://localhost:3000,https://fluxpay-frontend.onrender.com,https://fluxpay.onrender.com"

    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    jwt_secret: str = "your_super_secret_jwt_key"
    jwt_refresh_secret: str = "your_super_secret_refresh_key"
    jwt_access_expires_in: int = 3600
    jwt_refresh_expires_in: int = 604800

    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"

    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    email_host: str = "localhost"
    email_port: int = 1025
    email_secure: bool = False
    email_user: Optional[str] = None
    email_pass: Optional[str] = None
    email_from: str = "no-reply@fluxpay.com"

    mpesa_consumer_key: Optional[str] = None
    mpesa_consumer_secret: Optional[str] = None
    mpesa_shortcode: Optional[str] = None
    mpesa_passkey: Optional[str] = None
    mpesa_callback_url: str = ""
    mpesa_initiator_name: Optional[str] = None
    mpesa_environment: str = "sandbox"

    @property
    def is_production(self) -> bool:
        return self.node_env == "production"

    @property
    def parsed_allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def mpesa_base_url(self) -> str:
        if self.mpesa_environment == "production":
            return "https://api.safaricom.co.ke"
        return "https://sandbox.safaricom.co.ke"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
