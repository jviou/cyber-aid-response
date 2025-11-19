# 1) Build front Vite
FROM node:20-alpine AS builder

WORKDIR /app

# URL de l'API de crise, on met un défaut qui pointe sur le service docker "crisis-api"
ARG VITE_CRISIS_API_URL=http://crisis-api:4000
ENV VITE_CRISIS_API_URL=$VITE_CRISIS_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Image finale minimaliste
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# On remet l'ARG pour que server.js puisse aussi y accéder si besoin
ARG VITE_CRISIS_API_URL=http://crisis-api:4000
ENV VITE_CRISIS_API_URL=$VITE_CRISIS_API_URL

# seules les deps "prod"
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# on copie le build front et le serveur Node
COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 8080
CMD ["node", "server.js"]
