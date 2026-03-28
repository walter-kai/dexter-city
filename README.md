# Dexter City

Dexter City is a full-stack crypto app that was intended to become a marketplace for trading bot strategies.

The original product direction was:

- strategy marketplace (buy/sell/hire bots)
- custom bot creation with DCA-style parameters
- charting and pool analytics using Uniswap network data
- execution vision centered on Uniswap v4 hooks

This repository contains the web platform and API layer for that vision.

---

## What this codebase currently includes

### 1) Strategy marketplace UX

- Bot marketplace screens for buying and selling
- Bot detail modals and filtering UI
- Listing flow for user-owned bots

Note: parts of the marketplace are currently UI/prototype behavior with placeholder purchase actions.

### 2) Bot builder with DCA-oriented settings

Users can create bots with parameters such as:

- `initialOrderSize`
- `priceDeviation`
- `safetyOrders`
- `safetyOrderGapMultiplier`
- `safetyOrderSizeMultiplier`
- `takeProfit`
- `trailingTakeProfit`
- `cooldownPeriod`

Bots are stored in Firestore and can be started/stopped/killed through API endpoints.

### 3) Uniswap data integration for charts and pool activity

- Fetches pools and swap data from the Uniswap v4 subgraph via The Graph
- Builds candlestick chart data for pair analysis
- Supports daily pool activity snapshots and comparisons

### 4) Wallet authentication

- MetaMask signature flow on the client
- JWT issuance and protected server routes
- user profile fetch/update endpoints

### 5) Supporting utilities

- CoinMarketCap token metadata syncing
- social/news and sentiment endpoints
- link preview endpoint
- Telegram contact-message relay endpoint

---

## Architecture

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Express + TypeScript
- Auth: MetaMask signature + JWT
- Data: Firebase Firestore (and storage bucket)
- Market data: Uniswap v4 subgraph (The Graph), CoinMarketCap token metadata

Project layout:

- `client/` — React app
- `server/` — Express API
- `.types/` — shared TypeScript interfaces

---

## Local development

### Prerequisites

- Node.js 20+
- npm
- MetaMask browser extension
- Firebase project/service account credentials
- The Graph API key for Uniswap subgraph access

### 1) Install dependencies

From repository root:

- `npm install`

Then install client dependencies:

- `cd client && npm install`

### 2) Configure environment variables

Create a root `.env` file with values used by the server.

Required/commonly used:

- `PORT` (default server is `3001`)
- `JWT_SECRET`
- `THEGRAPH_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_CLIENT_X509_CERT_URL`

Optional:

- `TELEGRAM_BOT_TOKEN`
- `MY_TELEGRAM_CHAT_ID`

### 3) Run in development

From root:

- `npm run dev`

This starts:

- API server on `http://localhost:3001`
- client app on `http://localhost:3000`

The Vite dev server proxies `/api` requests to the backend.

---

## Build and run (production mode)

### Build TypeScript server output

- `npm run build`

### Start compiled server

- `npm run start`

The server serves the built client from `client/dist`.

---

## API surface (high-level)

Base path: `/api`

- `/auth` — MetaMask authentication
- `/user` — profile and user updates
- `/bot` — create/manage user bots
- `/subgraph` — pools/swaps/daily pool snapshots
- `/cmc` — token metadata utilities
- `/social-news` — social/news feed endpoint
- `/sentiment` — sentiment endpoint
- `/link` — URL preview endpoint
- `/telegram` — send contact messages to Telegram

Many bot and subgraph routes require JWT auth.

---

## Product status and intent

Dexter City is best understood as a strong prototype of a bot-strategy marketplace platform.

The intended core idea remains:

1. discover and trade bot strategies,
2. create your own bot and DCA strategy,
3. analyze markets with Uniswap-derived charts,
4. execute through a Uniswap-hook-driven architecture.

The execution-contract layer for hook-based order settlement is not implemented in this repository as a complete production trading engine.

---

## Notes

- This repo contains active prototype code and some legacy paths.
- Treat secrets and API keys as sensitive; do not commit real credentials.
- Review and harden auth, validation, and production config before public deployment.
