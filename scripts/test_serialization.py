import sys
import os
import traceback

# Add backend to path so we can import app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.models.base import BaseDocument
    from beanie import PydanticObjectId
    from pydantic import Field
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

class MockModel(BaseDocument):
    name: str
    owner_id: PydanticObjectId = Field(alias="ownerId")

def test_to_dict():
    print("Testing BaseDocument.to_dict serialization...")
    
    # Create a mock instance
    oid = PydanticObjectId()
    model = MockModel(name="Test", owner_id=oid)
    model.id = PydanticObjectId() # Simulate saved state
    
    data = model.to_dict()
    
    print(f"Serialized Data: {data}")
    
    # Assertions
    assert isinstance(data["ownerId"], str), f"ownerId should be a string, got {type(data['ownerId'])}"
    assert data["ownerId"] == str(oid), "ownerId value mismatch"
    assert data["id"] == str(model.id), "id mismatch"
    assert data["_id"] == str(model.id), "_id mismatch"
    
    print("✅ Serialization test passed! No raw PydanticObjectId found.")

if __name__ == "__main__":
    try:
        test_to_dict()
    except Exception:
        traceback.print_exc()
        sys.exit(1)
