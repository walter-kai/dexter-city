# Stage 1: Build the client (React app)
FROM node:20-alpine AS client-build

# Set working directory
WORKDIR /app/client

# Copy the client dependencies and package.json
COPY client/package.json client/package-lock.json ./

# Install client dependencies
RUN npm install

# Copy the client source code to the container
COPY client/ ./

# Build the React app
RUN npm run build

# Stage 2: Build the server (Node/Express with TypeScript)
FROM node:20-alpine AS server-build

# Set working directory for server
WORKDIR /app

# Copy server dependencies and package.json
COPY package.json package-lock.json tsconfig.json ./

# Install server dependencies
RUN npm install

# Copy server source code
COPY src/ ./src

# Build server TypeScript
RUN npm run build

# Stage 3: Final stage to run the app (server and serve React build)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy server code from the build stage
COPY --from=server-build /app/ ./

# Copy client build from the client build stage
COPY --from=client-build /app/client/build ./client/build

# Install production dependencies for server
RUN npm install --only=production

# Expose the ports (frontend on 3000, backend on 3001)
EXPOSE 3000 3001

# Start the server (which will also serve the React app)
CMD ["npm", "run", "start"]
