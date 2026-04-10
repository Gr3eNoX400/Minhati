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
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Telegram**: node-telegram-bot-api

## Theme

- **Direction**: RTL (Right-to-Left), Arabic language
- **Font**: Tajawal (Google Fonts)
- **Colors**: Dark Blue (#1E3A8A / `222 47% 11%`) and Gold (#F59E0B / `38 92% 50%`)

## Architecture

### Frontend (`artifacts/minhati`)

Pages/Screens:
- `DisclaimerModal` — First-visit disclaimer, saves consent to localStorage
- `Login` — NIN (18-digit strict validation) + NNI input, saves to localStorage
- `TelegramVerification` — Shows 6-digit code, polls backend for verification
- `Dashboard` — Blank dashboard shown after Telegram verification

### Backend (`artifacts/api-server`)

Routes:
- `POST /api/auth/generate-code` — Generates a 6-digit verification code linked to NIN/NNI
- `GET /api/auth/verify-status?nin=...` — Checks if NIN has been verified via Telegram
- Telegram bot polls for incoming messages and links chat_id to NIN on 6-digit code match

## Phase 1 Features

- [x] Disclaimer modal with localStorage consent
- [x] Login with strict 18-digit NIN validation
- [x] NNI input field
- [x] 6-digit verification code generation
- [x] Telegram bot integration (@Minhatiibot)
- [x] Auto-polling frontend for verification status
- [x] Dashboard page post-verification
- [x] GitHub sync

## GitHub Repository

`https://github.com/Gr3eNoX400/Minhati`

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/minhati run dev` — run frontend locally

## Pending (Phase 2+)

- ANEM API integration
- Employment file status display
- Push notifications via Telegram when status changes
