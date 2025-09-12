# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# variables Vite lues à build time si présentes
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DEFAULT_SESSION_ID
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_DEFAULT_SESSION_ID=${VITE_DEFAULT_SESSION_ID}
RUN npm run build

# Serve (vite preview)
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app ./
EXPOSE 5173
CMD ["npm","run","preview","--","--host","0.0.0.0","--port","5173"]
