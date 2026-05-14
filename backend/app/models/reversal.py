from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import PydanticObjectId
from pydantic import Field
from app.models.base import BaseDocument


class Reversal(BaseDocument):
    owner_id: PydanticObjectId = Field(alias="ownerId")
    original_transaction_id: PydanticObjectId = Field(alias="originalTransactionId")
    reversal_transaction_id: Optional[str] = Field(
        default=None, alias="reversalTransactionId"
    )
    conversation_id: Optional[str] = Field(default=None, alias="conversationId")
    amount: float
    phone_number: str = Field(alias="phoneNumber")
    mpesa_receipt_no: Optional[str] = Field(default=None, alias="mpesaReceiptNo")
    status: Literal["PENDING", "SUCCESS", "FAILED"] = "PENDING"
    reason: str
    response_code: Optional[str] = Field(default=None, alias="responseCode")
    response_description: Optional[str] = Field(
        default=None, alias="responseDescription"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reversals"
        indexes = [
            [("owner_id", 1), ("created_at", -1)],
            "original_transaction_id",
            "status",
        ]
