# 1) Build front Vite
FROM node:20-alpine AS builder

WORKDIR /app

# On passe l’URL de l’API + l’ID de session partagé
ARG VITE_CRISIS_API_URL
ARG VITE_DEFAULT_SESSION_ID

ENV VITE_CRISIS_API_URL=${VITE_CRISIS_API_URL}
ENV VITE_DEFAULT_SESSION_ID=${VITE_DEFAULT_SESSION_ID}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Image finale minimaliste
FROM node:20-alpine

WORKDIR /app

ARG VITE_CRISIS_API_URL
ARG VITE_DEFAULT_SESSION_ID

ENV VITE_CRISIS_API_URL=${VITE_CRISIS_API_URL}
ENV VITE_DEFAULT_SESSION_ID=${VITE_DEFAULT_SESSION_ID}

ARG VITE_CRISIS_API_URL
ARG VITE_DEFAULT_SESSION_ID
ENV VITE_CRISIS_API_URL=$VITE_CRISIS_API_URL
ENV VITE_DEFAULT_SESSION_ID=$VITE_DEFAULT_SESSION_ID

# seules les deps "prod"
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# on copie le build dans ./public pour le serveur Node
COPY --from=builder /app/dist ./public
COPY server.js ./server.js

EXPOSE 8080
CMD ["node", "server.js"]
