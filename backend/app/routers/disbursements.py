from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.services.disbursement import initiate_b2c_disbursement
from app.utils.logger import logger

router = APIRouter()


@router.post("/", response_model=dict)
async def create_disbursement(
    disbursement_data: dict,
    current_user: User = Depends(get_current_user),
):
    phone_number = disbursement_data.get("phoneNumber")
    amount = disbursement_data.get("amount")
    reference = disbursement_data.get("reference")
    remarks = disbursement_data.get("remarks")

    if not phone_number or not amount or not reference:
        raise HTTPException(
            status_code=400,
            detail="Phone number, amount, and reference are required",
        )

    if float(amount) < 10:
        raise HTTPException(
            status_code=400, detail="Minimum disbursement amount is KES 10"
        )

    result = await initiate_b2c_disbursement(
        phone_number=phone_number,
        amount=float(amount),
        reference=reference,
        remarks=remarks,
    )

    transaction = Transaction(
        owner_id=current_user.id,
        daraja_request_id=result.get("conversationId") or reference,
        amount_kes=float(amount),
        status="PENDING",
        retry_count=0,
    )
    await transaction.create()

    return {
        "message": "Disbursement initiated successfully",
        "data": {
            "_id": str(transaction.id),
            "id": str(transaction.id),
            "conversationId": result.get("conversationId"),
            "reference": reference,
            "amount": float(amount),
            "status": "PENDING",
        },
    }


@router.get("/", response_model=dict)
async def get_disbursements(
    current_user: User = Depends(get_current_user), limit: int = 20, page: int = 1
):
    skip = (page - 1) * limit
    transactions = (
        await Transaction.find({"owner_id": current_user.id})
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await Transaction.find({"owner_id": current_user.id}).count()

    return {
        "data": [
            {
                "_id": str(tx.id),
                "id": str(tx.id),
                "amountKes": tx.amount_kes,
                "status": tx.status,
                "darajaRequestId": tx.daraja_request_id,
                "mpesaReceiptNo": tx.mpesa_receipt_no,
                "transactionDate": tx.transaction_date,
                "createdAt": tx.created_at,
                "updatedAt": tx.updated_at,
            }
            for tx in transactions
        ],
        "total": total,
        "page": page,
        "totalPages": (total + limit - 1) // limit,
    }
