from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import Field
from app.models.base import BaseDocument


class PublicCheckoutTransaction(BaseDocument):
    plan: Literal["starter", "growth"]
    phone_number: str = Field(alias="phoneNumber")
    amount_kes: float = Field(alias="amountKes")
    daraja_request_id: str = Field(unique=True, alias="darajaRequestId")
    status: Literal["PENDING", "SUCCESS", "FAILED"] = "PENDING"
    mpesa_receipt_no: Optional[str] = Field(default=None, alias="mpesaReceiptNo")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "publiccheckouttransactions"
