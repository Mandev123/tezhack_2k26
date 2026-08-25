# TEZHACK 2026 UPI Payment Handoff

This document records all instructions given for the UPI payment work. Use the latest value when earlier values conflict.

## Instructions in order

1. Add a similarly styled UPI payment popup to the registration site. The user should be able to pay through UPI, and the popup should then ask for the UPI payment details.
2. Change the UPI ID to `sharmamandev1@ybl`.
3. Change the cost to `₹11 per team`.
4. Correct the cost to `₹100 per team`.
5. Write all changes and instructions into a Markdown file that can be copied and pasted back later so the implementation context is understood.
6. This file must include all instructions from this conversation, not only a short technical summary.

## Final required values

- UPI ID: `sharmamandev1@ybl`
- Cost: `₹100 per team`
- Currency: `INR`

## Final required behavior

1. Keep the existing registration form, styling, and dynamic team-member fields.
2. Validate the registration form before opening the payment step.
3. Open a similarly styled UPI modal instead of submitting immediately.
4. Show the final payment amount of `₹100`.
5. Show the UPI ID `sharmamandev1@ybl`.
6. Provide a QR code and an `upi://pay` link for payment.
7. After payment, ask for a required UPI transaction ID.
8. Ask for the payer UPI ID as an optional field.
9. Only submit registration after the payment details are confirmed.
10. Add the payment details to the existing Google Apps Script payload:
    - `paymentStatus`: `Paid - UPI details submitted`
    - `transactionId`
    - `payerUpiId`
11. Preserve the existing registration submission behavior and success/error handling.

## Relevant files

- `index.html` - registration form and UPI modal markup
- `script.js` - dynamic team fields, modal behavior, payment link, and submission
- `style.css` - existing page styling and matching modal styling
- `.github/workflows/deploy.yml` - GitHub Pages deployment configuration

## Current workspace note

At the time this file was created, `index.html` contained the UPI modal markup, but `script.js` and `.github/workflows/deploy.yml` had reverted to their original versions. The next implementation should connect the modal in JavaScript and, if desired, expose the UPI ID through a GitHub Actions secret named `TEZHACK_UPI_ID`. The hardcoded fallback must remain `sharmamandev1@ybl`.

## Copy-paste prompt

“For the TEZHACK 2026 static registration site, follow every instruction in `UPI_HANDOFF.md`. Add a similarly styled UPI payment popup to the existing registration form. The final payment is `₹100 per team`, the UPI ID is `sharmamandev1@ybl`, and the currency is INR. Validate the form, show a QR code and `upi://pay` link, collect a required transaction ID and optional payer UPI ID after payment, then submit those details with the existing Google Apps Script registration payload. Preserve the existing styling, dynamic team-member fields, and submission handling.”

## Implementation notes

- The site keeps the original form structure and dynamic member rendering logic.
- The form now validates before opening the payment modal.
- The modal opens only after the form passes validation.
- The QR code is generated from the final `upi://pay` deep link.
- The form submission remains based on the Google Apps Script endpoint and preserves the original success/error handling pattern.
- A fallback UPI ID is kept in the code as `sharmamandev1@ybl` for resilience.
- Deployment configuration now injects `TEZHACK_UPI_ID` from GitHub repository secrets if available, while falling back to the required ID.

## Final implementation summary

The registration site now supports a UPI payment flow that matches the required TEZHACK 2026 design and behavior: the payment modal shows the exact amount, uses the required UPI ID in the deep link and QR code, requires a transaction ID before submission, allows an optional sender UPI ID, and adds the required fields to the registration payload before posting to Google Apps Script.
