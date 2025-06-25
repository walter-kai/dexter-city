# Stage 0: Build the client (React app)
FROM node:20-alpine AS client-build

WORKDIR /client

# Copy client dependencies and install
COPY ./client/package*.json ./
RUN npm install

# Copy client source code and shared types
COPY ./client/ ./
COPY ./.types/ ../.types

# Pass environment variables for the client build
# Set the specific hostname for the production environment
ARG VITE_SERVER_HOSTNAME
ENV VITE_SERVER_HOSTNAME=${VITE_SERVER_HOSTNAME:-https://dexter-city-882290629693.us-central1.run.app}

# Build the React app
RUN npm run build

# Stage 1: Build the server (Node/Express with TypeScript)
FROM node:20.8.0-alpine3.18 AS server-build

WORKDIR /server

# Copy root dependencies and install
COPY ./package*.json ./
COPY ./tsconfig.json ./tsconfig.json
RUN npm install --include=dev

# Copy server source code and shared types
COPY ./server/ ./server
COPY ./.types/ ./.types

# Build server TypeScript
RUN npm run build

# Stage 2: Final stage with Nginx
FROM nginx:stable-alpine

WORKDIR /app

# Copy React build files to Nginx HTML directory
COPY --from=client-build /client/dist /usr/share/nginx/html

# Copy server build files and shared types
COPY --from=server-build /server/dist ./dist
COPY --from=server-build /server/.types ./.types

# Copy Nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# Install required tools
RUN apk add --no-cache nodejs npm curl bash netcat-openbsd

# Install production dependencies for the server
COPY ./package*.json ./
RUN npm install --only=production

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Starting backend server..."\n\
node dist/server/server.js &\n\
SERVER_PID=$!\n\
\n\
echo "Waiting for backend server to be ready..."\n\
timeout=30\n\
while [ $timeout -gt 0 ]; do\n\
  if nc -z 127.0.0.1 3001; then\n\
    echo "Backend server is ready!"\n\
    break\n\
  fi\n\
  echo "Backend not ready yet, waiting... ($timeout seconds left)"\n\
  sleep 1\n\
  timeout=$((timeout-1))\n\
done\n\
\n\
if [ $timeout -eq 0 ]; then\n\
  echo "ERROR: Backend server failed to start within timeout period"\n\
  exit 1\n\
fi\n\
\n\
echo "Testing backend endpoints..."\n\
curl -s http://localhost:3001/cron/health || echo "Warning: Cron health endpoint not responding"\n\
\n\
echo "Starting NGINX..."\n\
exec nginx' > /start.sh && chmod +x /start.sh

# Expose ports
EXPOSE 3001 443

# Use the startup script
CMD ["/start.sh"]