# Google Authentication Integration Checklist

## Backend

- [x] Install `passport`, `passport-google-oauth20`, and `@types/passport-google-oauth20`.
- [x] Configure Passport.js with Google OAuth 2.0 strategy.
- [x] Add environment variables for Google Client ID and Client Secret to `.env.example`.
- [x] Create a new file `backend/src/config/passport.ts` to configure the passport strategy.
- [x] Update `backend/src/models/User.ts` to include `googleId`.
- [x] Add new routes for Google authentication in `backend/src/api/auth/auth.routes.ts`.
- [x] Update `backend/src/api/auth/auth.controller.ts` to handle Google login/signup logic.
- [x] Integrate passport into the main server file `backend/src/server.ts`.

## Frontend

- [x] Add a "Sign in with Google" button to `frontend/src/pages/Login.tsx`.
- [x] Add a "Sign up with Google" button to `frontend/src/pages/Signup.tsx`.
- [x] Update `frontend/src/services/api.ts` to handle the Google authentication flow.
- [x] Create a new page/component to handle the redirect from the google callback.
- [x] Update `frontend/src/context/AuthContext.tsx` to handle user state after Google login.

## Documentation

- [x] Create this checklist in `AGENT.md` and `PROMPT.md`.
