from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse
import json

from app.utils.idempotency import check_idempotency, save_idempotency
from app.models.user import User


class IdempotencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        user = await self.get_current_user(
            request
        )  # Assuming a way to get user from request

        # Check for existing idempotency key
        idempotency_response = await check_idempotency(request, user)
        if idempotency_response:
            return idempotency_response

        # Process the request
        response = await call_next(request)

        # Save the response if it's a successful modification (e.g., POST, PUT, DELETE)
        # This is a simplified check; a more robust solution might check response status codes or specific endpoints
        if request.method in ["POST", "PUT", "DELETE"] and response.status_code in [
            200,
            201,
            204,
        ]:
            idempotency_key = request.headers.get("X-Idempotency-Key")
            if idempotency_key:
                # Try to parse response body for saving
                try:
                    response_body = json.loads(response.body)
                except json.JSONDecodeError:
                    response_body = {
                        "message": "Non-JSON response saved"
                    }  # Handle non-JSON responses if necessary

                await save_idempotency(
                    key=idempotency_key,
                    user_id=str(user.id),
                    path=request.url.path,
                    response_code=response.status_code,
                    response_body=response_body,
                )

        return response

    async def get_current_user(self, request: Request) -> User:
        # This is a placeholder. In a real app, this would involve:
        # 1. Extracting token from headers/cookies.
        # 2. Verifying token.
        # 3. Fetching user from DB.
        # For this example, we'll mock a user to allow the middleware to function.
        # In the actual implementation, this should be a dependency injected like:
        # user: User = Depends(get_current_user)

        # Placeholder for demonstration: Assume user ID '66396b62f9c181d9964f0001' exists
        # This needs to be replaced with actual dependency injection from auth.py
        mock_user_id = "66396b62f9c181d9964f0001"  # Replace with a valid user ID if testing locally
        try:
            user = await User.get(mock_user_id)
            if user:
                return user
            else:
                # Fallback or raise error if mock user is not found
                raise HTTPException(status_code=401, detail="Mock user not found")
        except Exception as e:
            raise HTTPException(
                status_code=401, detail=f"Could not get current user: {e}"
            )
