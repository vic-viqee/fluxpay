from pydantic import BaseModel, ConfigDict
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


class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None
    
    model_config = ConfigDict(populate_by_name=True)


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: Optional[list[str]] = None
