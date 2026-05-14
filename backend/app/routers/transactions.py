from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.common import StandardResponse
from app.utils.logger import logger

router = APIRouter()


@router.get("/", response_model=StandardResponse[dict])
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

    result = [tx.to_dict() for tx in transactions]

    return StandardResponse(
        data={
            "data": result,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
            "total": total,
        }
    )


@router.get("/{transaction_id}", response_model=StandardResponse)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or str(transaction.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    return StandardResponse(data=transaction.to_dict())


@router.get("/dashboard/stats", response_model=StandardResponse)
async def get_transaction_stats(
    current_user: User = Depends(get_current_user),
):
    # This would be implemented with proper aggregation
    # For now returning empty stats to maintain structure
    return StandardResponse(
        data={
            "today": {"success": 0, "pending": 0, "failed": 0},
            "month": {"success": 0, "pending": 0, "failed": 0},
            "recentTransactions": [],
            "customerCount": 0,
        }
    )
