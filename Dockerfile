# 1) Build front Vite
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_CRISIS_API_URL=http://127.0.0.1:4000
ENV VITE_CRISIS_API_URL=$VITE_CRISIS_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Image finale minimaliste
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

ARG VITE_CRISIS_API_URL=http://127.0.0.1:4000
ENV VITE_CRISIS_API_URL=$VITE_CRISIS_API_URL

# seules les deps "prod"
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# on copie le build dans ./public pour le serveur Node
COPY --from=builder /app/dist ./public
COPY server.js ./server.js

EXPOSE 8080
CMD ["node", "server.js"]
