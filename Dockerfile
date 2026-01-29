# Multi-stage build for nexs web application
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Build arguments for environment variables
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_CLERK_PUBLISHABLE_KEY

# Set environment variables for build
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLIC_CLERK_PUBLISHABLE_KEY

# Build the application
RUN npm run build

# Stage 2: Production (Node.js standalone)
FROM node:20-alpine

WORKDIR /app

# Copy built output and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["node", "./dist/server/entry.mjs"]
