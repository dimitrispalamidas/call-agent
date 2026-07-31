# CallAgent — Multi-org AI Call Center

Inbound AI phone agents per organization:

1. Caller dials the org Twilio number
2. OpenAI Realtime answers from the org knowledge base
3. If needed, the call is transferred to a human employee

## Stack

- `apps/web` — Next.js dashboard, auth, KB, Twilio HTTP webhooks
- `apps/voice` — WebSocket bridge (Twilio Media Streams ↔ OpenAI Realtime)
- `packages/db` — shared types/helpers
- `supabase/migrations` — schema, RLS, RAG RPC

## Prerequisites

- Node 20+
- pnpm
- Supabase project
- OpenAI API key (Realtime + embeddings)
- Twilio account + phone number
- Public tunnels for local dev (e.g. ngrok): HTTPS for Next.js, WSS for voice

## Setup

```bash
pnpm install
cp .env.example .env.local
# also symlink/copy env for voice if needed:
cp .env.local .env
```

Apply the SQL migration in `supabase/migrations/20260731120000_initial.sql` in the Supabase SQL editor (or via Supabase CLI).

Fill env vars from `.env.example`.

### Twilio

Point the phone number voice webhook to:

```
POST https://YOUR_PUBLIC_WEB_URL/api/twilio/voice
```

Set:

```
VOICE_SERVER_WS_URL=wss://YOUR_PUBLIC_VOICE_HOST/media-stream
NEXT_PUBLIC_APP_URL=https://YOUR_PUBLIC_WEB_URL
INTERNAL_API_SECRET=long-random-string
```

## Develop

```bash
# terminal 1
pnpm dev:web

# terminal 2
pnpm dev:voice
```

Dashboard: [http://localhost:3000](http://localhost:3000)

## Product flow

1. Sign up / log in
2. Create an organization
3. Settings → bind Twilio number (E.164)
4. Knowledge base → upload PDF/TXT/MD
5. Employees → add transfer targets
6. Call the Twilio number

## Deploy notes

- `apps/web` can deploy to Vercel
- `apps/voice` needs a long-lived Node host (Fly.io / Railway / VM) because of WebSockets
- Keep `INTERNAL_API_SECRET` identical on web and voice
- Voice service calls Next.js internal APIs for KB search + transfer

## Monorepo scripts

```bash
pnpm dev          # web + voice
pnpm dev:web
pnpm dev:voice
pnpm build
```
