# Multi-stage build for production
# Stage 1: Build the frontend
FROM node:18 AS frontend

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Setup the backend
FROM node:18

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --only=production

# Copy backend source
COPY backend/ .

# Copy built frontend to public directory
COPY --from=frontend /app/dist /app/public

# Expose port
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]