from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.utils.logger import logger

router = APIRouter()


@router.get("/", response_model=dict)
async def get_transactions(
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
    limit: int = 20,
    page: int = 1,
):
    query = [Transaction.owner_id == current_user.id]
    if status:
        query.append(Transaction.status == status)

    skip = (page - 1) * limit
    transactions = (
        await Transaction.find(*query)
        .skip(skip)
        .limit(limit)
        .sort([("transactionDate", -1)])
        .to_list()
    )
    total = await Transaction.find(*query).count()

    result = []
    for tx in transactions:
        result.append(
            {
                "_id": str(tx.id),
                "id": str(tx.id),
                "amountKes": tx.amount_kes,
                "status": tx.status,
                "mpesaReceiptNo": tx.mpesa_receipt_no,
                "transactionDate": tx.transaction_date,
                "darajaRequestId": tx.daraja_request_id,
            }
        )

    return {
        "data": result,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit,
        "total": total,
    }


@router.get("/{transaction_id}", response_model=dict)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or str(transaction.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {
        "_id": str(transaction.id),
        "id": str(transaction.id),
        "subscriptionId": str(transaction.subscription_id)
        if transaction.subscription_id
        else None,
        "ownerId": str(transaction.owner_id),
        "amountKes": transaction.amount_kes,
        "status": transaction.status,
        "mpesaReceiptNo": transaction.mpesa_receipt_no,
        "darajaRequestId": transaction.daraja_request_id,
        "retryCount": transaction.retry_count,
        "transactionDate": transaction.transaction_date,
        "createdAt": transaction.created_at,
        "updatedAt": transaction.updated_at,
    }


@router.get("/dashboard/stats", response_model=dict)
async def get_transaction_stats(
    current_user: User = Depends(get_current_user),
):
    # This would be implemented with proper aggregation
    return {
        "today": {"success": 0, "pending": 0, "failed": 0},
        "month": {"success": 0, "pending": 0, "failed": 0},
        "recentTransactions": [],
        "customerCount": 0,
    }
