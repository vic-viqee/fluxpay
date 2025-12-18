CODING AGENT TASK: FLUXPAY RECURRING BILLING ENGINE IMPLEMENTATION

This document outlines the complete set of tasks required to transition the FluxPay application from a static prototype to a functional Minimum Viable Product (MVP) capable of managing recurring M-Pesa subscriptions.

Target Stack: Node.js, Express.js, TypeScript, Mongoose (MongoDB), React, Tailwind CSS.




PHASE 1: stk push testion

The following issues must be resolved to ensure a functional user onboarding experience.

Task 1.1: Fix Popup message when stk push is sent succsessfully 

even when an stkpush is completed succsess fully the the popup returns failed to initialise the stk psh
•
Action: Investigate the site for a bug causing this error

•
Goal: Ensure the the popup returns the correct message 


PHASE 2: Core Backend Implementation (Recurring Billing Engine)

This phase implements the business logic for the full subscription lifecycle (Scenario Steps 1-4).

Task 2.1: Database Model Creation/Update (backend/src/models/)

Create or update the following Mongoose schemas to support the required data structure:

Model
Status
Required Fields/Updates
ServicePlan
NEW
name, amountKes (number), frequency (enum: monthly, weekly, etc.), billingDay (number), ownerId (ref to User).
Client
UPDATE
Ensure fields for name, phoneNumber (string, validated for M-Pesa format), email, and ownerId are present.
Subscription
UPDATE
Ensure fields for clientId, planId, status (enum: PENDING_ACTIVATION, ACTIVE, etc.), and nextBillingDate (Date) are present.
Transaction
UPDATE
Ensure fields for subscriptionId, amountKes, status (enum: PENDING, SUCCESS, FAILED), mpesaReceiptNo, darajaRequestId, and retryCount (number) are present.


Task 2.2: API Endpoint Implementation (backend/src/api/)

Implement the necessary API routes:

Module
Endpoint
Method
Description
plans
/api/plans
POST
Step 1: Create a new ServicePlan.
subscriptions
/api/subscriptions
POST
Step 2: Onboard a client. Create a Subscription with status: PENDING_ACTIVATION. Set nextBillingDate to the first due date (e.g., 5th of next month). Trigger initial client invitation notification.
payments
/api/payments/callback
POST
Step 4: Finalize M-Pesa Daraja Webhook. Find Transaction by darajaRequestId. Update status to SUCCESS or FAILED. Trigger success/failure notifications to Alex and John.


Task 2.3: Automated Billing Engine (backend/src/services/)

Implement the core business logic for scheduled payments.

1.
Create BillingService: A new service file (e.g., billing.service.ts) to house the logic.

2.
Implement Scheduler: Use a Node.js scheduling library (e.g., node-cron) to run a processDuePayments function daily.

3.
processDuePayments Logic (Step 4 - System Check & Trigger):

•
Query for ACTIVE subscriptions where nextBillingDate <= today.

•
For each due subscription:

•
Create a PENDING Transaction record.

•
Call the M-Pesa STK Push service.

•
Save the darajaRequestId.

•
Update the Subscription's nextBillingDate to the next cycle.





4.
Implement Retry Logic (Step 4 - Failure Handling):

•
Check for FAILED transactions with retryCount < 3 and a 24-hour cool-down.

•
If eligible, initiate a new STK Push, increment retryCount, and alert the owner (Alex).






PHASE 3: Frontend Integration & Dashboard Support

This phase ensures the frontend can interact with the new backend features.

Task 3.1: Create Plan Management Forms

•
Action: Create a new page or modal in the frontend to allow the authenticated user (Alex) to create a new ServicePlan (Step 1).

•
Goal: Implement a form that captures Service Name, Amount, Frequency, and Billing Day and sends the data to the new /api/plans endpoint.

Task 3.2: Create Client Onboarding Form

•
Action: Create a form (e.g., a modal triggered by the "Add Subscription" button) to onboard a new client (Step 2).

•
Goal: Implement a form that captures Client Name, Phone Number, Email, and allows the user to select an existing Service Plan from a dropdown (populated by a GET /api/plans call). This form submits to the /api/subscriptions endpoint.

Task 3.3: Dashboard Status Display

•
Action: Update the dashboard components to reflect the new subscription and transaction statuses.

•
Goal: Ensure the dashboard can display the PENDING_ACTIVATION status for new clients and the SUCCESS/FAILED status for transactions, providing clear visual feedback to the user (Alex).




Deliverables

The agent's final delivery should include all modified and new source code files, ensuring the application runs without compilation errors and the core recurring billing engine is fully functional.

TASK 1: Redesign "Simulate STK Push" Functionality

The current "Simulate STK Push" functionality is likely a simple button. This task requires converting the simulation into a dedicated, user-friendly form.

1.1: Convert Button to Form

•
Action: When the user clicks the "Simulate STK Push" button on the dashboard, it should not trigger a direct API call or a simple pop-up. Instead, it should display a dedicated form (either in a modal or a new section on the dashboard).

•
Goal: Provide a clear interface for testing the M-Pesa integration.

1.2: Form Fields and Validation

The form must include the following fields, which are necessary for a successful STK Push:

Field
Input Type
Validation
Rationale
Phone Number
Text Input
Required, Kenyan M-Pesa format (e.g., 2547XXXXXXXX).
The number to receive the STK push.
Amount (KES)
Numeric Input
Required, greater than 1.
The amount to be charged.
Account Reference
Text Input
Optional, but recommended.
A unique identifier for the transaction (e.g., invoice number).
Transaction Description
Text Input
Optional.
A short description for the M-Pesa statement.


1.3: Submission and Feedback

•
Action: Upon form submission, the frontend should call the existing /api/payments/stk-push endpoint.

•
Goal: Display a clear, user-friendly message indicating the STK Push has been initiated (e.g., "STK Push sent to [Phone Number]. Please check your phone.").




TASK 2: Button Styling and Visibility Fixes

Several buttons across the application (especially on the dashboard and potentially the login/signup pages) are either not visible, lack appropriate styling, or appear as plain text, which severely impacts usability.

2.1: Global Button Styling Review

•
Action: Review all interactive elements that function as buttons (e.g., "Logout," "Simulate STK Push," "Add Subscription," "Sign In," "Sign Up").

•
Goal: Ensure all buttons adhere to the existing Tailwind CSS design system, using appropriate classes for:

•
Background Color: Use primary brand colors (e.g., blue/purple/green accents).

•
Text Color: Ensure high contrast (e.g., white text on a colored background).

•
Padding and Margins: Ensure adequate spacing.

•
Hover/Focus States: Implement visual feedback on interaction.

•
Disabled States: Clearly indicate when a button is not clickable.



2.2: Specific Button Visibility Fixes

•
Action: Specifically target the buttons on the dashboard and the navigation bar to ensure they are clearly identifiable as clickable elements and not just plain text.

•
Goal: All call-to-action buttons must have a distinct background and border to visually separate them from surrounding text and elements.

