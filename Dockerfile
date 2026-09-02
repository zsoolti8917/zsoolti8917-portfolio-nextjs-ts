# syntax=docker/dockerfile:1
# Multi-stage build for the portfolio (Next.js 14, Pages Router).
# NEXT_STANDALONE=1 flips next.config.mjs to output: 'standalone' so the
# runner stage ships only server.js + pruned node_modules (~150MB image).

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The hero status bar prints the commit; there is no .git in the build
# context, so pass it in (next.config.mjs reads COMMIT_REF, same as Netlify).
ARG COMMIT_REF=docker
ENV COMMIT_REF=$COMMIT_REF \
    NEXT_STANDALONE=1 \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
