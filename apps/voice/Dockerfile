FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/voice/package.json ./apps/voice/package.json

RUN pnpm install --filter voice... --frozen-lockfile

COPY apps/voice ./apps/voice

WORKDIR /app/apps/voice
RUN pnpm exec tsc

ENV NODE_ENV=production
ENV VOICE_PORT=3001
EXPOSE 3001

CMD ["node", "dist/index.js"]
