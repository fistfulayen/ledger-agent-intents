# Ledger Agent Payments API

- **Machine-readable spec**: `apps/web/public/openapi.json` (served at `/openapi.json`)
- **Static HTML docs (fetch-friendly)**: `apps/web/public/docs/index.html` (served at `/docs`)
- **In-app docs page**: `apps/web/src/routes/docs.tsx`

## Authentication

Two modes are supported:

- **AgentAuth (preferred)**: send `Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>` with requests.
  - `timestamp`: unix epoch seconds (must be recent; ~5 minute window)
  - `bodyHash`: `keccak256` of the raw JSON body as hex (use `0x` for GET requests)
  - `signature`: EIP-191 `personal_sign` over `<timestamp>.<bodyHash>` with the agent key
- **Legacy/demo**: no auth required; `POST /api/intents` may include `userId` in the JSON body (defaults to `demo-user`).

## API Endpoints (Vercel API)

- **Health**
  - `GET /api/health`

- **Intents**
  - `POST /api/intents`
  - `GET /api/intents?userId=...&status=...&limit=...`
  - `GET /api/intents/:id`
  - `POST /api/intents/status` (preferred static route)
  - `PATCH /api/intents/:id/status` (legacy alternative)
  - `GET /api/users/:userId/intents?status=...&limit=...` (equivalent list route)

- **Agents**
  - `POST /api/agents/register`
  - `GET /api/agents?trustchainId=...`
  - `GET /api/agents/:id`
  - `POST /api/agents/revoke` (preferred static route)
  - `DELETE /api/agents/:id` (legacy alternative)

- **Auth / compatibility**
  - `GET /api/me?wallet=...` (compat; session auth disabled)
  - `POST /api/auth/logout`
  - `POST /api/auth/challenge` (disabled; returns 501)
  - `POST /api/auth/verify` (disabled; returns 501)

## Response envelope

All endpoints return JSON:

- Success: `{ "success": true, ... }`
- Error: `{ "success": false, "error": "message" }`

