# FluxPay - M-Pesa Payment and Subscription Platform

## Project Overview

FluxPay is a web application designed to manage M-Pesa payments and subscriptions for Kenyan small businesses. This project has been re-architected into a modern full-stack application with a React frontend and a Node.js/Express/TypeScript backend, ensuring strict separation of concerns, modularity, and scalability.

It provides a complete solution for businesses to handle user authentication, subscription plans, and real-time payment processing via M-Pesa's STK push functionality.

## Features

### Frontend
-   **Modern UI:** Built with React, Vite, and Tailwind CSS for a responsive and intuitive user experience.
-   **Modular Components:** Reusable UI components and a clear page-based structure.
-   **Client-Side Routing:** Fast navigation using React Router DOM.
-   **Authentication Flow:** Secure user login and signup with JWT-based authentication.
-   **API Integration:** Seamless communication with the Node.js backend.

### Backend
-   **Robust API:** Developed with Node.js, Express.js, and TypeScript for a type-safe and scalable API.
-   **User Authentication:** JWT-based (Access + Refresh tokens) for secure API access.
-   **M-Pesa Integration:** Full Daraja API integration for STK Push, including OAuth token generation, callback handling, and Kenyan phone number validation.
-   **Database Integration:** Configured for MongoDB (using Mongoose) for persistent data storage.
-   **Centralized Error Handling:** Consistent error responses across the API.
-   **Logging:** Integrated Winston for structured logging.
-   **Modular Architecture:** Clean separation of routes, controllers, services, and models.

## Tech Stack

-   **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router DOM, Axios
-   **Backend:** Node.js, Express.js, TypeScript, Mongoose, jsonwebtoken, bcrypt, dotenv, Winston, Joi (for validation - future integration), Axios
-   **Database:** MongoDB (via Mongoose)
-   **Containerization (Optional):** Docker, Docker Compose

## Folder Structure

```
fluxpay/
  ├── README.md                  ← This file
  ├── frontend/                  ← React application
  │   ├── public/                ← Static assets (e.g., images)
  │   ├── src/
  │   │   ├── assets/            ← Images, icons
  │   │   ├── components/        ← Reusable UI components (Navbar, Footer, StatCard, etc.)
  │   │   ├── context/           ← React Context for global state (e.g., AuthContext)
  │   │   ├── hooks/             ← Custom React Hooks
  │   │   ├── layouts/           ← Layout components (e.g., MainLayout)
  │   │   ├── pages/             ← React components for each route/page
  │   │   ├── services/          ← API service (Axios instance)
  │   │   └── App.tsx            ← Main application component (or main.tsx entry)
  │   ├── index.html             ← Frontend HTML entry point
  │   ├── package.json           ← Frontend dependencies and scripts
  │   ├── tailwind.config.js     ← Tailwind CSS configuration
  │   └── tsconfig.json          ← TypeScript configuration for frontend
  ├── backend/                   ← Node.js/Express/TypeScript API
  │   ├── src/
  │   │   ├── api/               ← API modules (auth, payments, subscriptions, users, etc.)
  │   │   │   ├── auth/
  │   │   │   ├── payments/
  │   │   │   ├── subscriptions/
  │   │   │   ├── users/
  │   │   │   └── ...
  │   │   ├── config/            ← Configuration files (db, index)
  │   │   ├── middleware/        ← Express middleware (auth, errorHandler)
  │   │   ├── models/            ← Mongoose schemas (User, Subscription, Transaction)
  │   │   ├── services/          ← Business logic services (e.g., mpesa.service)
  │   │   ├── utils/             ← Utility functions (logger, phone number validation)
  │   │   └── server.ts          ← Main backend application entry point
  │   ├── package.json           ← Backend dependencies and scripts
  │   ├── tsconfig.json          ← TypeScript configuration for backend
  │   └── .env.example           ← Example environment variables for backend
  ├── .env.example               ← Combined example environment variables for both (legacy, use backend/.env.example for backend)
  ├── docker-compose.yml         ← Optional: Docker Compose for services like MongoDB
```

## Prerequisites

-   **Node.js**: (v18 or higher recommended)
-   **npm**: (Node Package Manager)
-   **MongoDB**: (running locally or a cloud instance like MongoDB Atlas)
-   **ngrok**: (for M-Pesa Daraja API callbacks to your local machine)

## Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd fluxpay/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
        (On Windows: `copy .env.example .env`)
    -   Open the newly created `.env` file and fill in the required values:
        -   `PORT`: Port for the backend server (default: `3000`).
        -   `JWT_SECRET`: A strong, random string for JWT signing.
        -   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/fluxpay`).
        -   **M-Pesa Credentials (from Safaricom Daraja Developer Portal):**
            -   `CONSUMER_KEY`
            -   `CONSUMER_SECRET`
            -   `SHORTCODE` (Your LIPA NA MPESA Short Code)
            -   `PASSKEY` (Your LIPA NA MPESA Online Checkout Passkey)
            -   `CALLBACK_URL`: Public URL for Daraja API callbacks (see ngrok setup below).

4.  **M-Pesa Ngrok Setup (for local development callbacks):**
    The Daraja API requires a publicly accessible URL to send payment notifications.
    -   Start ngrok, forwarding to your backend port (e.g., 3000):
        ```bash
        ngrok http 3000
        ```
    -   Ngrok will provide a "Forwarding" URL (e.g., `https://random-string.ngrok.io`).
    -   Update `CALLBACK_URL` in your `.env` file with this URL, appending the callback path:
        Example: `CALLBACK_URL=https://random-string.ngrok.io/api/payments/callback`

5.  **Run the backend server (development mode):**
    ```bash
    npm run dev
    ```
    The server will start and automatically restart on file changes.

## Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd fluxpay/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables (optional, if different from default):**
    The frontend uses `VITE_API_URL` to connect to the backend. By default, it points to `http://localhost:3000/api`. If your backend runs on a different URL/port, create a `.env` file in `fluxpay/frontend` and add:
    ```
    VITE_API_URL=http://localhost:YOUR_BACKEND_PORT/api
    ```

4.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will start on a local port (e.g., `http://localhost:5173`).

## Connecting Frontend to Backend

The frontend `fluxpay/frontend/src/services/api.ts` file is configured with Axios to automatically attach the JWT authentication token from `localStorage` to all outgoing requests to the backend API. It uses `import.meta.env.VITE_API_URL` for the backend base URL, falling back to `http://localhost:3000/api`.

## API Endpoints (Backend)

All backend routes are prefixed with `/api`.

### Authentication
-   `POST /api/auth/signup`: Register a new user.
-   `POST /api/auth/login`: Log in a user and receive a JWT.

### Payments
-   `POST /api/payments/stk-push`: Initiate an M-Pesa STK push payment. (Requires JWT)
-   `POST /api/payments/callback`: Webhook endpoint for M-Pesa Daraja API notifications.

### Subscriptions
-   `POST /api/subscriptions`: Create a new subscription. (Requires JWT)
-   `GET /api/subscriptions`: Get all subscriptions for the authenticated user. (Requires JWT)
-   `GET /api/subscriptions/:id`: Get a specific subscription. (Requires JWT)
-   `PUT /api/subscriptions/:id`: Update a specific subscription. (Requires JWT)
-   `DELETE /api/subscriptions/:id`: Delete a specific subscription. (Requires JWT)

### Users
-   `GET /api/users/me`: Get the profile of the currently authenticated user. (Requires JWT)

### Transactions
-   `GET /api/transactions`: Get all transactions for the authenticated user. (Requires JWT)

### Placeholder APIs (Further Implementation Needed)
-   `GET /api/customers`: Placeholder for customer data.
-   `GET /api/analytics`: Placeholder for dashboard metrics.
-   `GET /api/settings`: Placeholder for user settings updates.
-   `GET /api/docs`: Placeholder for API documentation information.

## Running the Complete Application

1.  **Start MongoDB:** Ensure your MongoDB instance is running. If using Docker Compose:
    ```bash
    cd fluxpay
    docker-compose up -d mongo
    ```
2.  **Start the Backend:**
    ```bash
    cd fluxpay/backend
    npm run dev
    ```
3.  **Start ngrok:** (if testing M-Pesa locally)
    ```bash
    ngrok http 3000
    ```
    Update your backend's `.env` `CALLBACK_URL`.
4.  **Start the Frontend:**
    ```bash
    cd fluxpay/frontend
    npm run dev
    ```

Open your browser to the frontend address (e.g., `http://localhost:5173`). You can now sign up, log in, and interact with the FluxPay application.