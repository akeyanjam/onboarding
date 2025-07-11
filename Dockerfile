# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.mjs ./
COPY components.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build frontend
RUN npm run build

# Production stage
FROM node:20-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Create app user
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

# Setup directories
WORKDIR /app
RUN mkdir -p /var/log/supervisor /run/nginx

# Copy frontend build from build stage
COPY --from=frontend-build /app/dist ./frontend/dist

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source code
COPY backend/ ./backend/

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Set permissions
RUN chown -R app:app /app && \
    chown -R app:app /var/log/supervisor && \
    chown -R nginx:nginx /run/nginx && \
    chown -R nginx:nginx /var/lib/nginx

# Expose port 80
EXPOSE 80

# Start supervisord to manage nginx and backend
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"] 