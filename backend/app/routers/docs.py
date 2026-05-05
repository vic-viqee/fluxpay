from fastapi import APIRouter

router = APIRouter()


@router.get("/", response_model=dict)
async def get_api_docs():
    return {
        "message": "FluxPay API Documentation",
        "version": "2.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "gateway-auth": "/api/gateway-auth",
            "payments": "/api/payments",
            "subscriptions": "/api/subscriptions",
            "clients": "/api/clients",
            "plans": "/api/plans",
            "transactions": "/api/transactions",
            "users": "/api/users",
            "settings": "/api/settings",
            "analytics": "/api/analytics",
            "apikeys": "/api/apikeys",
            "thirdparty": "/api/v1",
            "invoices": "/api/invoices",
            "mpesa": "/api/mpesa",
            "disbursements": "/api/disbursements",
            "admin": "/api/admin",
            "gateway": "/api/gateway",
            "public-checkout": "/api/pay",
        },
    }
