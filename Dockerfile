# ARMY Hub — production container image.
# Build:  docker build -t army-hub .
# Run:    docker run -p 3000:3000 -e SITE_URL=https://example.com army-hub
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# uploads and the JSON database are written here (mounted as a volume to keep data between restarts)
RUN mkdir -p /app/data /app/uploads
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server.js"]
