from datetime import datetime, timezone
from typing import Optional, Literal, Any
from beanie import Document, Link, PydanticObjectId
from pydantic import Field


class Transaction(Document):
    subscription_id: Optional[PydanticObjectId] = Field(
        default=None, alias="subscriptionId"
    )
    owner_id: PydanticObjectId = Field(alias="ownerId")
    amount_kes: float = Field(alias="amountKes")
    status: Literal["PENDING", "SUCCESS", "FAILED"] = "PENDING"
    mpesa_receipt_no: Optional[str] = Field(default=None, alias="mpesaReceiptNo")
    daraja_request_id: str = Field(alias="darajaRequestId")
    retry_count: int = Field(default=0, alias="retryCount")
    transaction_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="transactionDate"
    )
    callback_data: Optional[dict[str, Any]] = Field(default=None, alias="callbackData")
    failure_reason: Optional[str] = Field(default=None, alias="failureReason")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "transactions"
        indexes = [
            "owner_id",
            "daraja_request_id",
        ]
