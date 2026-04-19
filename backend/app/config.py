from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    ENVIRONMENT: str = "development"
    SECRET_KEY: str
    ALLOWED_ORIGINS: list[str] = ["https://sir-spendalot.tmn.name"]

    # Auth — single-user self-hosted. Change both values in .env before first use.
    AUTH_USERNAME: str = "admin"
    AUTH_PASSWORD: str = "changeme"
    # Token lifetime in minutes (default: 7 days — convenient for self-hosted)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
