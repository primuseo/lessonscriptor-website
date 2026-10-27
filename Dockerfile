# Self-hosted build for Coolify on the primuseo VPS. Vercel ignores this file.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT_STANDALONE=1
# Prerendering needs the Stripe pack links; Coolify passes env vars as build args.
ARG STRIPE_PACK_STARTER_LINK_URL STRIPE_PACK_STUDENT_LINK_URL STRIPE_PACK_HEAVY_LINK_URL
RUN NODE_OPTIONS=--max-old-space-size=1536 npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/en >/dev/null || exit 1
CMD ["node", "server.js"]
