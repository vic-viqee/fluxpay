import os

os.environ["MONGODB_DB_NAME"] = "fluxpay_test"
os.environ["MONGODB_URL"] = "mongodb://localhost:27017"

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c