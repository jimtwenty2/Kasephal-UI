FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG NEXT_BASE_API_URL
ARG BETTER_AUTH_SECRET
ARG NEXT_PUBLIC_IMAGE_BASE_URL
ARG IMAGE_BASE_URL
ARG AUTH_URL
ARG AUTH_TRUST_HOST
ARG NEXT_PUBLIC_BASE_API_URL
ARG NEXT_PUBLIC_BASE_WS_URL

ENV NEXT_PUBLIC_BASE_WS_URL=$NEXT_PUBLIC_BASE_WS_URL
ENV NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL
ENV AUTH_URL=$AUTH_URL
ENV AUTH_TRUST_HOST=$AUTH_TRUST_HOST
ENV NEXT_BASE_API_URL=$NEXT_BASE_API_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV IMAGE_BASE_URL=$IMAGE_BASE_URL
ENV NEXT_PUBLIC_IMAGE_BASE_URL=$NEXT_PUBLIC_IMAGE_BASE_URL

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]