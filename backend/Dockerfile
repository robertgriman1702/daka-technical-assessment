# ----------------------------
# STAGE 1: Builder
# ----------------------------
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# 1) Copy package files
COPY package*.json ./

# 2) Install deps (incluye devDeps para compilar Nest)
RUN npm ci

# 3) Copy source
COPY . .

# 4) Build
RUN npm run build


# ----------------------------
# STAGE 2: Production
# ----------------------------
FROM node:20-slim AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# 1) Copy package files
COPY package*.json ./

# 2) Install only production deps
RUN npm ci --omit=dev

# 3) Copy compiled dist from builder
COPY --from=builder /usr/src/app/dist ./dist

# COPY --from=builder /usr/src/app/package.json ./package.json

# 4) Use non-root user
USER node

# 5) Expose port
EXPOSE 3000

# 6) Run app
CMD ["node", "dist/main.js"]
