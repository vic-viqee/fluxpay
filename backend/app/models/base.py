from beanie import Document, PydanticObjectId
from pydantic import ConfigDict, Field
from datetime import datetime, timezone
from typing import Optional


class BaseDocument(Document):
    """
    Base Beanie Document with global configuration for:
    - camelCase aliases support (populate_by_name)
    - JSON serialization fixes
    """
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
    
    def to_dict(self):
        """Standard helper to dump model with aliases and string IDs"""
        data = self.model_dump(by_alias=True)
        
        # Recursively convert PydanticObjectId to string to avoid serialization errors
        def stringify_ids(obj):
            if isinstance(obj, dict):
                return {k: stringify_ids(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [stringify_ids(i) for i in obj]
            if isinstance(obj, PydanticObjectId):
                return str(obj)
            return obj
            
        data = stringify_ids(data)
        
        # Ensure ID fields are present as strings
        if self.id:
            data["id"] = str(self.id)
            data["_id"] = str(self.id)
            
        return data
