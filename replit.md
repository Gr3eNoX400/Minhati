# Minhati PWA

## Overview

Minhati is an unofficial helper PWA for Algerian job seekers to track their ANEM employment file and receive Telegram notifications on updates.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Frontend**: React + Vite + Tailwind CSS v4
- **Telegram**: node-telegram-bot-api
- **Build**: esbuild

## Theme

- **Direction**: RTL (Right-to-Left), Arabic language
- **Font**: Tajawal (Google Fonts)
- **Background**: Dark Blue `222 47% 11%`
- **Primary/Gold**: `38 92% 50%`
- **Cards**: Glassmorphism (`bg-white/5 backdrop-blur-md border border-white/10`)

## Architecture

### Frontend (`artifacts/minhati`)

Pages/Screens:
- `DisclaimerModal` — First-visit disclaimer, saves consent to localStorage
- `Login` — NIN (18-digit strict) + NNI input. Always shows "وضع المعاينة" button to skip directly to mock dashboard. URL shortcut: `/?preview=true`
- `TelegramVerification` — 6-digit code display, auto-polls backend, "Skip" button
- `Dashboard` — Full glassmorphism dashboard with bottom nav (Home / Notifications / Profile)

Dashboard features:
- User info card (name, agency, masked NIN)
- Status card: green (eligible), orange (suspended + motif), red (rejected)
- Telegram notify toggle (sends message to linked chat_id)
- Action buttons: "تجديد المنحة" + "تغيير رقم الهاتف" with loading → success states
- Controls checklist (ANEM verification checkpoints)
- Profile tab: CCP payment date calculator (last digit 0-3→26th, 4-6→27th, 7-9→28th)
- Notifications tab: placeholder

### Backend (`artifacts/api-server`)

Routes:
- `POST /api/verify-anem` — Calls ANEM API with browser headers + SSL bypass. Returns `code: "TIMEOUT"` or `"CONNECTION_FAILED"` on failure.
- `POST /api/auth/generate-code` — Generates 6-digit Telegram verification code
- `GET /api/auth/verify-status?nin=...` — Checks if NIN verified via Telegram
- `POST /api/auth/notify` — Sends Telegram message to linked chat_id

## Mock Data (Gartoufa Djamaleddine)

```json
{
  "nin": "109991165003180008",
  "name": "جمال الدين قرطوفة",
  "agency": "الوكالة المحلية راس الواد",
  "etat": 2,
  "motif": "الغياب في التكوين"
}
```

Access via `/?preview=true` URL.

## Telegram Bot

- Handle: `@Minhatiibot`
- Token: stored in `artifacts/api-server/src/routes/telegram.ts`

## GitHub Repository

`https://github.com/Gr3eNoX400/Minhati`

## Key Commands

- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/minhati run dev` — run frontend
- `pnpm --filter @workspace/api-server run build` — build API

## ANEM API

URL: `https://ac-controle.anem.dz/AllocationChomage/api/validateCandidate/query`  
Params: `wassitNumber`, `identityDocNumber`  
Note: Replit IPs are blocked by ANEM — always times out. Frontend falls back to mock mode.
