# AGENT.md - Master Guide for AI Coding Agents on FluxPay Project

This document serves as a comprehensive guide for any AI coding agent working on the FluxPay project. It outlines the project's purpose, current state, operational guidelines, and future roadmap, ensuring consistency and efficiency in development.

## 1. What is FluxPay?

FluxPay is a payment automation platform designed for Kenyan businesses to streamline M-Pesa payments and subscriptions. It aims to provide tools for recurring billing, instant checkouts, payment tracking, and reconciliation without the need for traditional Paybill or Till numbers for all users. It caters to freelancers, gyms, SaaS, and subscription-based businesses.

## 2. What the System Currently Supports

The FluxPay project is a full-stack application with a React frontend and a Node.js/Express/TypeScript backend.

### Frontend:
*   **User Authentication:** Login and Signup pages with user and business detail collection.
*   **Multi-step Signup:** A guided onboarding process for new users, collecting personal and business information.
*   **Dashboard:** Displays user-specific data including total revenue, active subscriptions, success rate, and pending payments. Includes a user profile section with dynamic business data.
*   **Pricing Page:** An interactive pricing page with Free, Starter, Growth, and Enterprise tiers. Features dynamic selection, and initiates different flows based on the chosen plan (signup, subscription checkout, or contact sales modal).
*   **Subscription Checkout Page:** A mock checkout page for paid plans, initiating STK Push.
*   **Public Pages:** Home (Index), Documentation, Pricing.
*   **Components:** Reusable UI components for navigation (Navbar), layout (Footer, MainLayout), data display (StatCard, SubscriptionsTable, TransactionsTable, UserProfile), and interactive elements (FaqItem, PricingCard, ContactSalesModal).
*   **Styling:** Utilizes Tailwind CSS for styling, with a cohesive UI/UX and responsive design.

### Backend:
*   **User Management:** Routes for user signup and login (`/api/auth`).
*   **User Data Storage:** MongoDB integration (via Mongoose) for storing user data, including business details and selected plan.
*   **M-Pesa Integration:** Service for M-Pesa STK Push initiation (`/api/payments/initiate`). STK Push messages are customized with the business name.
*   **Data Endpoints:** Routes for managing payments, subscriptions, customers, analytics, settings, users, and transactions.
*   **Authentication Middleware:** Secure routes requiring authentication.
*   **Error Handling:** Centralized error handling middleware.
*   **Configuration:** Manages environment variables for port, JWT secret, MongoDB URI, and M-Pesa credentials.

## 3. What is Missing or Partially Complete

*   **Logo and Favicon:** (Task 1) - The user has not provided filenames for these assets.
*   **Complete Logo Upload Functionality:** Frontend has a placeholder for logo upload, but backend support for file storage and serving `logoUrl` is missing.
*   **Robust Input Validation:** While basic validation exists, more comprehensive server-side validation (e.g., regex for phone numbers, KRA PIN formats, business details) could be added.
*   **Actual Payment Processing:** The subscription checkout page has a mock STK push. Real-time handling of M-Pesa callbacks to update subscription statuses and process payments is implied but needs full implementation.
*   **Subscription Management:** Creation of subscriptions is yet to be built (Task 5).
*   **Dashboard Business Data Display:** While the `UserProfile` component has fields for business details, the dashboard's main view might need more prominent display of business-specific metrics or logo.
*   **Comprehensive Error Handling:** Frontend error messages could be more user-friendly and specific.
*   **Admin Panel:** No administrative interface for managing users, subscriptions, etc.
*   **Testing:** Unit and integration tests are not extensively present.
*   **Deployment Scripts:** Automated deployment scripts are not part of the current project.

## 4. Rules, Style Guidelines, Folder Structure, and Environment Expectations

*   **Language:** TypeScript for both frontend and backend.
*   **Frontend Framework:** React.js.
*   **Styling:** Tailwind CSS. Adhere to existing class usage and utility-first principles.
*   **Backend Framework:** Node.js with Express.
*   **Database:** MongoDB (Mongoose ODM).
*   **Code Style:** Follow existing project conventions (ESLint/Prettier configurations are implied but not explicitly enforced beyond TypeScript's strictness). Use clear, descriptive variable and function names.
*   **Folder Structure:** Maintain the current modular, feature-based folder structure (e.g., `api/auth`, `api/payments`, `pages`, `components`, `services`).
*   **Environment Variables:** Use `.env` files for sensitive configurations. Do NOT hardcode credentials.
*   **Modularity:** Create reusable components and services where appropriate.
*   **Accessibility:** Ensure all new UI elements are accessible (ARIA labels, keyboard navigation, color contrast).
*   **Responsiveness:** Design for mobile-first, ensuring full responsiveness across devices.

## 5. How to Run the Project

### Prerequisites:
*   Node.js (LTS recommended)
*   npm (usually comes with Node.js)
*   MongoDB instance (local or cloud-hosted)
*   Docker Desktop (if using `docker-compose` for MongoDB)

### Setup:
1.  **Clone the repository.**
2.  **Backend Setup:**
    *   Navigate to the `backend` directory: `cd backend`
    *   Install dependencies: `npm install`
    *   Create a `.env` file in the `backend` directory (if it doesn't exist) and populate it based on `.env.example`. Key variables include `PORT`, `JWT_SECRET`, `MONGODB_URI`, `CONSUMER_KEY`, `CONSUMER_SECRET`, `SHORTCODE`, `PASSKEY`, `CALLBACK_URL`.
    *   Start the backend server: `npm run dev`
3.  **Frontend Setup:**
    *   Navigate to the `frontend` directory: `cd frontend`
    *   Install dependencies: `npm install`
    *   Ensure a `.env` file in the project root (`fluxpay/.env`) defines `VITE_API_URL` pointing to your backend (e.g., `VITE_API_URL=http://localhost:3000`).
    *   Start the frontend development server: `npm run dev`

### Docker (Optional, for MongoDB):
*   Ensure Docker Desktop is running.
*   From the project root (`fluxpay/`), run `docker-compose up -d` to start a MongoDB container.

## 6. What Tasks Are Safe for Automation and What Tasks Require Asking the User

**Safe for Automation:**
*   Refactoring code for clarity, performance, or adherence to style guides (e.g., moving JSX to components, extracting logic to hooks/services).
*   Implementing new UI components based on existing design patterns (e.g., adding a form field, new table row, new button).
*   Creating or modifying API endpoints and database models for straightforward data storage and retrieval.
*   Adding basic validation logic (e.g., required fields, type checks).
*   Updating dependencies and fixing minor compilation errors (`TS2307`, `TS7006`) when the solution is clear (e.g., installing `@types`).
*   Cleanup tasks (e.g., removing unused imports, deleting redundant files) after explicit confirmation.

**Require Asking the User (High-Value Human Input):**
*   **Any decision impacting core business logic or user experience significantly.**
*   **Design-related choices that deviate from existing patterns** or require creative input (e.g., "how should this look?").
*   **Ambiguous requirements.**
*   **File Deletion:** Always confirm before deleting entire files or major sections of code.
*   **External Service Integration:** Confirm credentials, specific APIs, or service choices.
*   **Major Architecture Changes:** Any change that fundamentally alters how parts of the system interact.
*   **Data Migration/Manipulation:** Any task that could alter existing user data.
*   **Asset Management:** Explicit filenames, paths, and usage instructions for images, logos, favicons, etc.
*   **Deployment:** Changes to deployment configuration or process.

## 7. Roadmap of Remaining Features (from initial instructions)

1.  **Add Logo and Favicon:** (Currently Blocked - Awaiting user input on filenames)
    *   Use assets from `C:\Users\Vic\Documents\Projects\fluxpay\img`.
    *   Add to Navbar and Footer.
    *   Set favicon.
    *   Ensure responsiveness and cross-browser compatibility.
2.  **Add “Business Setup” During Account Creation:** (Completed - Task 2 done)
3.  **Customize Each STK Push With the Business Name:** (Completed - Task 3 done)
4.  **Create AGENT.md:** (Current Task)
5.  **Build a System to Add Subscriptions Seamlessly From the Dashboard.**
    *   UI: Customer name, phone, amount, billing frequency, start date, notes.
    *   Functional: Add without refresh, backend route, display in table, prep for recurring billing.
6.  **Make the Entire Site Fully Responsive.**
    *   Tailwind-based grid/flex, clean on Desktop, Tablet, Mobile.
    *   Add hamburger menu with animations.
7.  **Push Project to GitHub.**
    *   Create repo, add `.gitignore`, exclude sensitive files.

---
**This AGENT.md was created by an AI coding agent.**
