# Backend API — Node 22 required if using pnpm 10+; we pin pnpm 9 for broad compatibility
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile || pnpm install

COPY tsconfig.json ./
COPY src ./src

RUN pnpm prisma generate
RUN pnpm build

FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma

RUN pnpm install --prod --frozen-lockfile || pnpm install --prod
RUN pnpm prisma generate

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
