from pydantic import BaseModel
from typing import Optional, Any, Generic, TypeVar
from datetime import datetime

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    page: int
    total_pages: int
    total: int


class SuccessResponse(BaseModel):
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    message: str
    errors: Optional[list[str]] = None
