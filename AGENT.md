# Forgot Password Feature Checklist

## Frontend

- [x] Add "Forgot password?" link to `frontend/src/pages/Login.tsx`.
- [x] Create `frontend/src/pages/ForgotPassword.tsx` for requesting a password reset.
- [x] Create `frontend/src/pages/ResetPassword.tsx` for setting a new password.
- [x] Add routes for `ForgotPassword.tsx` and `ResetPassword.tsx` to `frontend/src/main.tsx`.
- [x] Implement logic in `ForgotPassword.tsx` to send a password reset request to the backend.
- [x] Implement logic in `ResetPassword.tsx` to send a new password and token to the backend.

## Backend

- [x] Add a new route `api/auth/forgot-password` to `backend/src/api/auth/auth.routes.ts`.
- [x] Add a new controller function `forgotPassword` to `backend/src/api/auth/auth.controller.ts` to handle sending reset emails.
- [x] Add a new route `api/auth/reset-password` to `backend/src/api/auth/auth.routes.ts`.
- [x] Add a new controller function `resetPassword` to `backend/src/api/auth/auth.controller.ts` to handle password resets.
- [x] Implement token generation and verification for password reset.
- [x] Integrate an email service (or simulate if none exists) to send password reset links.
- [x] Update `User` model to include `passwordResetToken` and `passwordResetExpires` fields.

## Documentation

- [x] Create this checklist in `AGENT.md` and `PROMPT.md`.
