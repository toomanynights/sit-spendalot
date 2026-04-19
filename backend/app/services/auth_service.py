"""
JWT authentication service — single-user, self-hosted MVP.

Enabling enforcement later is a one-line change:
  swap `optional_auth` for `require_auth` in any route dependency.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# auto_error=False → returns None instead of 401 when token is absent
_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)


# ------------------------------------------------------------------ #
# Password helpers                                                     #
# ------------------------------------------------------------------ #


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


# ------------------------------------------------------------------ #
# Token creation                                                       #
# ------------------------------------------------------------------ #


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


# ------------------------------------------------------------------ #
# FastAPI dependencies                                                  #
# ------------------------------------------------------------------ #


def optional_auth(token: Optional[str] = Depends(_oauth2_scheme)) -> Optional[str]:
    """
    Returns the username from a valid JWT, or None if no/invalid token.
    MVP: routes use this — auth passes silently without a token.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


def require_auth(token: Optional[str] = Depends(_oauth2_scheme)) -> str:
    """
    Enforces a valid JWT. Swap optional_auth → require_auth on any route
    to lock it down without other changes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Hark! Thy credentials are invalid or hath expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception


# ------------------------------------------------------------------ #
# Login                                                                #
# ------------------------------------------------------------------ #


def authenticate(username: str, password: str) -> str:
    """
    Validates credentials against config and returns a JWT on success.
    Raises 401 on failure.
    """
    valid_username = username == settings.AUTH_USERNAME
    # Compare plain password directly — appropriate for single-user self-hosted MVP.
    # To upgrade: store AUTH_PASSWORD_HASH in .env and call verify_password() here.
    valid_password = password == settings.AUTH_PASSWORD

    if not (valid_username and valid_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hark! Thy username or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return create_access_token(subject=username)
