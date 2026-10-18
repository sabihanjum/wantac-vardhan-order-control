# Wantace Solutions Sprint — Parts B–D Working Draft

## Part B — Requirement document: Vardhan Steelware

**Status:** Working draft based only on the supplied client pack. Items marked
“confirm” must be validated with the people who run the floor.

### 1. Problem statement

Vardhan does not have one reliable place to see where an order is, who owns the
next action, or why it is blocked. Suresh's words capture the immediate need:

> “Pata nahi chalta maal kahan atka hai.”

Today, a customer call often triggers another call to Ramesh because the latest
status is in a diary or scattered across WhatsApp and a sheet. Kunal asked for
marketplace integrations and an AI sales dashboard, but the evidence supports
solving order visibility, exceptions and outsourced-polishing reconciliation
first.

### 2. What the material shows

**Observed in the supplied records**

- The sheet contains **27 order rows** for 1–7 September 2026, including
  dispatched, pending, partial, return and payment-hold states.
- Gupta's 200-piece Kadai order appears once as dispatched and again as pending.
  This may be a repeat order or a duplicate entry; the system must not assume
  either without confirmation.
- Jain's 150-piece Kadhai order appears twice as `pend`, with the second row
  noting that it was sent again on WhatsApp.
- One row has no customer name: 20 dozen of Thali 12 inch.
- Verma's order is recorded as 180 kg with no rate; the note says the rate is
  still to be confirmed.
- Mehra's 300-piece order is partly dispatched: 180 sent and 120 remaining.
- Sharma has a 30-dozen order on payment hold with old dues of ₹1.8 lakh.
  A separate Sharma return is recorded as **-6 dozen** because of dents.
- Bansal's 120 Tope units are waiting for polishing. The same order appears in
  WhatsApp as still not returned from polishing.
- WhatsApp records a polishing lot of 420 kg sent to Pappu and 1,180 pieces
  returned, followed by a reported 6 kg shortage. Munshi ji planned to
  reconcile the lot later.
- WhatsApp also shows a possible duplicate or split Bhagona allocation
  (Gupta 40 and New Delhi 60), both in polishing.

**Agreement and tension in the client account**

- The claim of roughly 60–70 monthly orders is directionally plausible but
  should be reconciled against the actual sheet and sales channels.
- Online sales are currently described by Suresh as under 5% of business,
  although Kunal says they are growing 30% month-on-month. Growth rate and
  current share need a common definition before forecasting is designed.
- Suresh says payment is not a problem, but the records show a ₹1.8 lakh
  payment hold. Payment status is therefore operationally relevant even if
  collections are generally healthy.
- The previous ERP ran for three months because Ramesh and contractors did not
  use it. Adoption is a confirmed project risk, not a minor training detail.

### 3. As-is process

`Distributor / online customer`
→ **Order received** by phone or WhatsApp  
→ **Kunal records** the order in the Google Sheet  
→ **Production** makes the utensils  
→ **Ramesh coordinates status** and dispatch information (current details may
   be in his diary)  
→ **Polishing outsourced** to one of 4–5 contractors; material is weighed out
   and counted on return  
→ **Quantity reconciliation** by Ramesh and Munshi ji (exact control point:
   confirm)  
→ **Packing and dispatch**; partial dispatches are possible  
→ **Payment / hold check** by Suresh and Munshi ji  
→ **Customer follows up** when status is not visible.

The system should record the owner and timestamp of every status change, rather
than attempting to reproduce the current informal handoffs.

### 4. Phase 1 scope

#### In scope

1. **Single order register:** system-generated order ID, customer, order date,
   channel, line items, quantity/unit, rate, and notes.
2. **Controlled statuses:** New, confirmed, in production, sent for polishing,
   polishing returned, ready to pack, partly dispatched, dispatched, on hold,
   returned and cancelled.
3. **Blockers and ownership:** blocker type, explanation, owner, next action and
   due date. Payment hold must be distinct from production delay.
4. **Partial dispatches and returns:** quantity dispatched/returned, date,
   reason and remaining quantity.
5. **Polishing lots:** contractor, quantity/weight sent, quantity received,
   shortage or excess, dates and reconciliation status.
6. **Mobile-first views:** Suresh's exception view; Kunal's order entry and
   correction view; Ramesh's quick status and dispatch update view; Munshi ji's
   hold and reconciliation view.
7. **Audit trail and search:** who changed what and when; search by order,
   customer, item and status; CSV export for pilot review.

#### Explicitly out of Phase 1

- AI sales forecasting: insufficient clean historical data and not the
  immediate pain.
- Full ERP replacement: scope and adoption risk are too high for a first
  release.
- Automated Amazon/Flipkart integrations: online volume is currently small and
  channel workflows are not yet mapped.
- Inventory valuation, complete accounting replacement and automatic payment
  collection: define interfaces after Munshi ji's process is confirmed.
- Contractor self-service access: first validate whether contractors can and
  should update records.

These exclusions keep the first release small enough to pilot before Diwali and
avoid repeating the previous ERP's complexity.

**Phase 1 acceptance checks:** every order has a unique ID and one current
status; a user can identify the current owner and blocker from the order view;
partial dispatches show ordered, dispatched and remaining quantities; every
polishing lot shows sent, received and variance; and Suresh can open each of
the three reports on a phone without calling Ramesh for the underlying status.

### 5. Data model

| Entity | Key fields | Relationship / rule |
|---|---|---|
| Customer | customer ID, name, contacts, channel, payment status | One customer has many orders |
| Order | order ID, customer ID, received date, source, status, blocker, owner | One order has many items and dispatches |
| Order item | item ID, order ID, product, quantity, unit, rate | Quantity must use a declared unit |
| Production/polishing lot | lot ID, item ID, contractor, sent quantity/weight, received quantity, shortage, dates, reconciliation status | A line may have multiple lots |
| Dispatch | dispatch ID, order ID/item ID, quantity, date, transport/reference | Supports partial dispatch |
| Return | return ID, order/item, quantity, reason, date, disposition | Return is a transaction, not a negative order |
| Payment/hold | payment or hold ID, customer ID/order ID, amount, date, reference, status | Payment hold can block an order |
| Status event | event ID, order ID, old/new status, actor, timestamp, note | Immutable history for traceability |

Customer 1—many Orders; Order 1—many Order Items; Order Item 1—many Polishing
Lots and Dispatches. Accounting integration remains a discovery decision, not a
Phase 1 assumption.

### 6. Users and permissions

- **Suresh — owner:** read-only dashboard of delayed orders, payment holds,
  partial dispatches and polishing exceptions; may approve a hold release.
- **Kunal — order coordinator:** create and correct orders, manage customers,
  assign owners, and monitor all statuses.
- **Ramesh — dispatch/operations:** update production, polishing return,
  packing and dispatch quantities; cannot silently delete an order.
- **Munshi ji — accounts:** add payment status and holds, record reconciliation
  outcomes, and view rates and financial references.
- **Polishing contractors — not enabled initially:** access decision follows a
  workflow walkthrough.

### 7. Morning reports for Suresh

1. **Pending by stage:** order, customer, item, current owner, days in stage,
   promised date and next action.
2. **Blocked orders:** payment, missing rate/customer information, polishing
   shortage, quality/return or other blocker; show amount/quantity at risk.
3. **Polishing reconciliation:** contractor, lot, quantity sent, quantity
   received, shortage/excess, age and unreconciled lots.

### 8. Questions for the next call

1. **Suresh:** What single view must be available on your phone every morning?
2. **Suresh:** Who has final authority to release a payment-held order?
3. **Suresh:** What is the non-negotiable Diwali deadline and pilot size?
4. **Kunal:** Which sheet row is the source of truth when an order is resent or
   split across WhatsApp messages?
5. **Kunal:** How are online orders received, confirmed, cancelled and returned?
6. **Ramesh:** Please walk through one live order from production to dispatch;
   where is each update written today?
7. **Ramesh:** Who records polishing quantities at send and return, and what unit
   is authoritative when weight and piece count differ?
8. **Munshi ji:** How are payment holds, returns, shortages and adjustments
   reconciled with Tally?
9. **All operational users:** Which phone/device and network conditions must the
   workflow support on the floor?
10. **All users:** Which two fields made the previous ERP too difficult to use?

### 9. Main risk and mitigation

**Risk:** low adoption by Ramesh, floor staff and contractors, demonstrated by
the previous ERP's three-month lifespan. A system with a complete data model
but no timely status updates would make Suresh's visibility problem worse.

**Mitigation:** run a one-week pilot with real orders and Ramesh, Kunal and
Munshi ji; limit each update to the minimum required fields; use large,
mobile-friendly actions; measure status freshness and missing fields daily; and
revise the workflow from floor feedback before adding integrations or
forecasting.

---

## Part C — Handoff note for the Account Executive

**Decision-maker:** Suresh Vardhan signs cheques and appears to hold final
authority; confirm the purchase process and budget on the next call.

**Influencers:** Kunal wants a modern system and maintains the order sheet.
Ramesh and Munshi ji will determine whether the workflow works in practice.

**Likely users:** Kunal for order entry and monitoring; Ramesh for operational
and dispatch updates; Munshi ji for payment holds and reconciliation; Suresh
for the owner view.

**Core pain and evidence:** order status is scattered between Kunal's sheet,
Ramesh's diary and WhatsApp. The pack shows repeated-looking rows, an unnamed
order, partial dispatches, payment holds, returns and a polishing shortage.

**Ask versus need:** Kunal asked for marketplace integrations and AI
forecasting. The immediate need is a simple, adopted order-status workflow with
blockers, partial dispatches and polishing reconciliation.

**Objections to expect:** “The last ERP was too complicated,” limited time
before Diwali, uncertain value of a new system, and concern about users on the
floor not updating it. Do not lead with a large ERP promise. Demonstrate one
real order moving through the proposed workflow.

**Recommended next step and timeline:** schedule a 45-minute workflow session
with Suresh, Kunal, Ramesh and Munshi ji. Agree a small pilot of real orders,
success measures and the Diwali date before discussing expansion. Position the
first release as a focused visibility pilot; do not promise integrations or AI
until the underlying data and adoption are proven.

---

## Part D — Content

> **Important:** This section must be grounded in the candidate's own Part A
> audit. The copy below is a starting draft only. Replace the bracketed details
> with a real observation and remove the brackets before submission. Do not name
> the audited business or Vardhan.

### 1. LinkedIn post (under 150 words)

**Draft**

During a visit to a small [type of business] in [area], I noticed something
easy to miss: the work was moving, but the status was not.

An order could be discussed on WhatsApp, written in a register and updated
verbally on the floor. When the customer asked for a delivery date, the owner
had to call someone else to find out what had happened.

That is not always a production problem. It is often a visibility problem.

For small manufacturers, a useful first step is not a large ERP or an AI
dashboard. It is one shared order record with an owner, current stage, blocker
and next action.

My question for factory owners: if your most important customer called right
now, how many calls would it take to answer, “Where is my order?”

### 2. Meta ad

**Language:** Hinglish. Use this if the audited business owner and comparable
factory owners naturally use Hindi/Hinglish; otherwise translate to the
language actually observed in Part A.

**Primary text**

Order ka status jaanne ke liye baar-baar phone karna padta hai? Production,
polishing aur dispatch ko ek simple mobile view mein track kijiye. Dekhiye kaunsa
order pending hai, kahan hold hai aur next action kiski zimmedari hai — bina
complicated ERP ke.

**Headline**

Har order ka clear status

**Creative concept**

Split-screen creative: left shows a register, WhatsApp messages and several
missed calls; right shows one mobile order card with stage, blocker, owner and
next action. Use a real, anonymised workflow image from Part A only with
permission. Avoid claims of guaranteed savings or revenue growth.
