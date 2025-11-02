# Multi-stage build for StreamHub AI
# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY src ./src
COPY public ./public
COPY index.html vite.config.js eslint.config.js ./

# Build frontend
RUN npm run build

# Stage 2: Setup backend and serve
FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy backend source
COPY server ./server

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./server/public

# Create data directory for JSON feeds
RUN mkdir -p /app/server/public/data

EXPOSE 3001

WORKDIR /app/server

CMD ["node", "index.js"]
