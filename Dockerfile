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

EXPOSE 8080
CMD ["node", "server.js"]
