# Build stage
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src

RUN npm run build

# Runtime stage
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Playwright needs browser binaries and system deps at runtime
RUN npx playwright install --with-deps chromium

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "run", "start"]
