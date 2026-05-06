# FluxPay Migration & Project Guidelines

This file tracks the migration from Express to FastAPI and provides guidelines for development.

## Migration Fixes (Post-Deployment)

### 1. Password Hashing Compatibility
- **Fix:** Added `bcrypt` to `pwd_context` schemes in `backend/app/utils/password.py`.
- **Status:** Completed.

### 2. Google OAuth Flow Alignment
- **Fix:** Updated `auth_code_store` to track `userId` and modified code exchange to use `make_auth_response`, ensuring HTTP-only cookies are set and token refresh works.
- **Status:** Completed.

### 3. Token Generation Bug
- **Fix:** Added missing `gateway` parameter to `generate_access_token` in `backend/app/utils/tokens.py`.
- **Status:** Completed.

### 4. Database Initialization & Mapping
- **Fix:** Added `alias` parameters to `User` model fields in `backend/app/models/user.py` to match legacy camelCase MongoDB documents and ensure compatibility with existing data.
- **Status:** Completed.

### 5. Environment Configuration
- **Status:** Reviewed. Ensure `ALLOWED_ORIGINS`, `BACKEND_URL`, `FRONTEND_URL`, and `GOOGLE_REDIRECT_URI` are correctly set in the production environment.
