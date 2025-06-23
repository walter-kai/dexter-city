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

# Install production dependencies for the server
COPY ./package*.json ./
RUN apk add --no-cache nodejs npm && npm install --only=production

# Expose ports for Nginx and backend server
EXPOSE 3001 443

# Start Nginx and backend server using the start script in package.json
CMD ["sh", "-c", "npm run start & nginx -g 'daemon off;'"]

# Use official Node.js image
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install

# Copy source and build the app
COPY client/. .
RUN npm run build

# Production image
FROM node:20-alpine AS prod

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy built frontend from build stage
COPY --from=build /app/client/dist ./dist

# Expose port 3000 (Cloud Run default)
EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "dist", "-l", "3000"]