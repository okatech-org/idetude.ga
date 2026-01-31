# Stage 1: Build Frontend and Compile Server
FROM node:20-alpine AS builder

WORKDIR /app

# Hardcode Supabase public values for Vite build (these are public/anon keys)
ENV VITE_SUPABASE_URL="https://rwhvkchhvtthffbbgyts.supabase.co"
ENV VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3aHZrY2hodnR0aGZmYmJneXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNzU0MjIsImV4cCI6MjA4NDk1MTQyMn0.FCpQkOZP9M7pVARYJKKV6S15DHE7qEFvNL7C-_yos3U"
ENV VITE_SUPABASE_PROJECT_ID="rwhvkchhvtthffbbgyts"

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the frontend (Vite will embed the env vars)
RUN npm run build

# Compile TypeScript server to JavaScript
RUN npx tsc -p server/tsconfig.json --outDir server/dist

# Stage 2: Production Server
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy compiled server files (JavaScript)
COPY --from=builder /app/server/dist ./server

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the production server using compiled JavaScript
CMD ["node", "server/api.js"]
