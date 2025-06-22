# Stage 0: Build the client (React app)
FROM node:20-alpine AS client-build

WORKDIR /client

# Copy client dependencies and install
COPY ./client/package*.json ./
RUN npm install

# Copy client source code and shared models/types
COPY ./client/ ./

# Pass environment variables for the client build
ARG VITE_SERVER_HOSTNAME
ENV VITE_SERVER_HOSTNAME=${VITE_SERVER_HOSTNAME:-https://dexter-city-882290629693.us-central1.run.app}

# Build the React app
RUN npm run build

# Stage 1: Build the server (Node/Express with TypeScript)
FROM node:20-alpine AS server-build

WORKDIR /server

# Copy root dependencies and install
COPY ./package*.json ./
COPY ./tsconfig.json ./
RUN npm install --include=dev

# Copy server source code and shared models/types
COPY ./server/ ./server
COPY ./client/models/ ./models

# Build server TypeScript
RUN npm run build

# Stage 2: Final stage with Nginx
FROM nginx:stable-alpine

WORKDIR /app

# Copy React build files to Nginx HTML directory
COPY --from=client-build /client/dist /usr/share/nginx/html

# Copy server build files and shared models/types
COPY --from=server-build /server/dist ./dist
COPY --from=server-build /server/models ./models

# Copy Nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# Install production dependencies for the server
COPY ./package*.json ./
RUN apk add --no-cache nodejs npm && npm install --only=production

# Expose ports for Nginx and backend server
EXPOSE 3001 443

# Start Nginx and backend server using the start script in package.json
CMD ["sh", "-c", "npm run start & nginx -g 'daemon off;'"]