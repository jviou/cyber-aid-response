# Stage 1: Build the frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies (including devDependencies for build)
RUN npm install
COPY . .
# Build the React app to /app/dist
RUN npm run build

# Stage 2: Production Server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Install only production dependencies (express, socket.io)
RUN npm install --only=production
# Copy built static files
COPY --from=builder /app/dist ./dist
# Copy the server script
COPY server.js .

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["node", "server.js"]
