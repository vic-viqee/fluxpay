# FluxPay: M-Pesa Integration Roadmap

This document outlines potential features derived from the Safaricom Daraja API ecosystem and how they can be integrated into FluxPay to create a comprehensive financial management platform for Kenyan businesses.

## 1. Payments (Customer to Business)

### C2B (Customer to Business) - Paybill & Buy Goods
*   **Feature**: Implementation of **Validation** and **Confirmation** URLs.
*   **FluxPay Advantage**: 
    *   **Error Prevention**: Real-time validation allows FluxPay to reject payments made with incorrect account numbers *before* the customer enters their PIN.
    *   **Manual Payment Support**: Enables FluxPay to track and reconcile payments made via the M-Pesa menu (Lipa na M-Pesa), not just app-initiated STK pushes.
*   **Priority**: High (Critical for retail and utilities).

### Dynamic QR Code
*   **Feature**: Generate unique QR codes for specific transaction amounts.
*   **FluxPay Advantage**: 
    *   **Frictionless Retail**: Perfect for physical POS (Point of Sale) systems. Customers simply scan and pay without typing Till numbers or amounts.
    *   **Reduced Typos**: Eliminates the risk of customers entering the wrong amount.
*   **Priority**: Medium.

---

### 2. Disbursements (Business to Customer/Business)

### B2C (Business to Customer) - Bulk Payments
*   **Feature**: Automated money transfers from the business shortcode to individual phone numbers.
*   **FluxPay Advantage**: 
    *   **Automated Payouts**: Enables automated salary payments, promotional rewards, and instant refunds directly from the FluxPay dashboard.
    *   **Operational Efficiency**: Replaces manual "M-Pesa for Business" web portal entries with a single-click API call.
*   **Priority**: High (Key for betting, payroll, and e-commerce).

### B2B (Business to Business)
*   **Feature**: Transferring funds between different M-Pesa shortcodes (Paybills/Tills).
*   **FluxPay Advantage**: 
    *   **Supplier Payments**: Allows businesses to pay their vendors directly from their collected revenue.
    *   **Tax Remittance**: Simplifies paying KRA or other government services directly from the corporate Till.
*   **Priority**: Medium.

---

### 3. Financial Management & Reliability

### Transaction Status Request
*   **Feature**: Real-time polling for the final state of any transaction.
*   **FluxPay Advantage**: 
    *   **Automated Reconciliation**: If a callback is missed (e.g., due to server downtime), FluxPay can proactively ask Safaricom for the status to ensure no transaction is left "Pending."
*   **Priority**: High (Critical for data integrity).

### Account Balance Request
*   **Feature**: Query the current balance of the M-Pesa shortcode.
*   **FluxPay Advantage**: 
    *   **Real-time Liquidity Tracking**: Show the business owner exactly how much cash is available in their Paybill/Till directly on the FluxPay dashboard without them logging into the Daraja or M-Pesa portal.
*   **Priority**: High (Major UX improvement).

### Transaction Reversal
*   **Feature**: Initiating a reversal request for a successful transaction.
*   **FluxPay Advantage**: 
    *   **Customer Trust**: Businesses can manage disputes and accidental payments directly within FluxPay, increasing professional credibility.
*   **Priority**: Medium.

---

## Why these features matter for Enterprise Clients

1.  **Full Lifecycle Management**: By adding B2C and B2B, FluxPay stops being just a "collection tool" and becomes a "Cash Flow Management" tool.
2.  **Trust & Reliability**: Transaction Status polling ensures that "I paid but I don't see my credit" complaints are virtually eliminated.
3.  **Data Centralization**: Business owners want one dashboard (FluxPay) for everything, rather than switching between Safaricom portals, banks, and their own apps.
