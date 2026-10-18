# Vardhan Steelware Order Control MVP

This is a dependency-free Phase 1 prototype for the Vardhan Steelware
requirement document. It runs directly in a browser and uses `localStorage` for
the pilot data, so no server or database is required yet.

## Run it

Open [index.html](./index.html) in a browser.

For a local development server, from this folder run:

```powershell
py -m http.server 8080
```

Then open <http://localhost:8080>.

## Implemented

- Order register with unique IDs
- Search and status filtering
- New and edit order workflow
- Status, owner, blocker and next-action notes
- Partial dispatch quantities
- Owner dashboard metrics
- Blocked-order report
- Polishing reconciliation report
- Responsive mobile layout

## Pilot limitations

This is a front-end prototype, not a production system. Data is stored only in
the current browser. Before using it with real client data, add authentication,
an API, server-side validation, PostgreSQL persistence, audit history, and
role-based permissions.

The next production slice should extract the order model and status transitions
into an API, then add immutable status events and proper polishing-lot records.
