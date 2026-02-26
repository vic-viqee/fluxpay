# AGENT.md - Project Status Summary

This document summarizes the current development status of the FluxPay project, including completed work and outstanding issues.

## What Has Been Done

*   **Core Application Setup**: A full-stack application with a React frontend and Node.js/Express/TypeScript backend.
*   **User Authentication**: Implemented JWT-based authentication (signup, login, refresh tokens).
*   **M-Pesa Integration**: Full Daraja API integration for STK Push, including OAuth token generation, callback handling, and **enhanced Kenyan phone number validation**.
*   **Subscription & Plans API**: The API endpoints for creating (`POST /api/plans`) and fetching (`GET /api/plans`) service plans, and managing subscriptions, have been implemented on the backend.
*   **Logo Upload Feature**: Fully implemented on both frontend and backend.
*   **Backend Error Logging**: Enhanced database connection error logging in `backend/src/config/db.ts` and `backend/src/server.ts` to provide clearer messages during startup.

## Known Issues

*   **Backend Deployment on Render**: The `fluxpay-backend` service is not starting successfully after deployment. No runtime logs are visible, indicating an immediate crash upon `npm start` execution. This prevents the frontend from connecting (`ERR_CONNECTION_CLOSED`, `Network Error`). Likely due to an incorrect or missing environment variable (e.g., `MONGODB_URI`) or an environment-specific crash.
*   **Frontend Subscription Creation Error**: When attempting to create a new subscription, the frontend receives a `400 Bad Request` from `fluxpay-backend.onrender.com/api/subscriptions`. This suggests a validation error in the request payload, likely due to `clientId` or `planId` being missing or malformed.
*   **Remaining Placeholder APIs**: The following API endpoints are still placeholders and require further implementation: `GET /api/customers`, `GET /api/analytics`, `GET /api/settings`, `GET /api/docs`.
*   **Frontend `ERR_BLOCKED_BY_CLIENT`**: This error appears in the browser console, often related to browser extensions like ad-blockers, and is likely a secondary issue or unrelated to the core backend/API problems.
