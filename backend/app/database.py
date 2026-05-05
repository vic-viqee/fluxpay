from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from loguru import logger

from app.config import get_settings
from app.models.user import User
from app.models.transaction import Transaction
from app.models.subscription import Subscription
from app.models.service_plan import ServicePlan
from app.models.client import Client
from app.models.api_key import ApiKey
from app.models.audit_log import AuditLog
from app.models.invoice import Invoice
from app.models.webhook import Webhook
from app.models.gateway_transaction import GatewayTransaction
from app.models.gateway_customer import GatewayCustomer
from app.models.payment_link import PaymentLink
from app.models.reversal import Reversal
from app.models.public_checkout_button import PublicCheckoutButton
from app.models.public_checkout_transaction import PublicCheckoutTransaction
from app.models.c2b_transaction import C2BTransaction

client = None
db = None


async def init_db():
    global client, db
    settings = get_settings()
    try:
        client = AsyncIOMotorClient(
            settings.mongodb_uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000
        )
        # Verify connection
        await client.admin.command("ping")

        db = client[settings.mongodb_db_name]

        await init_beanie(
            database=db,
            document_models=[
                User,
                Transaction,
                Subscription,
                ServicePlan,
                Client,
                ApiKey,
                AuditLog,
                Invoice,
                Webhook,
                GatewayTransaction,
                GatewayCustomer,
                PaymentLink,
                Reversal,
                PublicCheckoutButton,
                PublicCheckoutTransaction,
                C2BTransaction,
            ],
        )
        logger.info("Database connected and Beanie initialized")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise


async def close_db():
    global client
    if client:
        client.close()
        logger.info("Database connection closed")


def get_db():
    return db
