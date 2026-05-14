from beanie import Document, PydanticObjectId
from pydantic import ConfigDict, Field
from datetime import datetime, timezone
from typing import Optional


class BaseDocument(Document):
    """
    Base Beanie Document with global configuration for:
    - camelCase aliases support (populate_by_name)
    - Automatic timestamp management (if needed)
    - JSON serialization fixes
    """
    
    # We can add common fields here if all models share them
    # For now, we focus on the Config
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={
            PydanticObjectId: str
        } if PydanticObjectId else {}
    )
    
    def to_dict(self):
        """Standard helper to dump model with aliases and string IDs"""
        data = self.model_dump(by_alias=True)
        data["id"] = str(self.id)
        data["_id"] = str(self.id)
        return data
