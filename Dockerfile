# Stage 1: Build stage
FROM node:24-alpine AS builder

# Upgrade system packages to patch vulnerabilities
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy code files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Production stage using Nginx
FROM nginx:alpine

# Upgrade system packages to patch vulnerabilities
RUN apk update && apk upgrade --no-cache

# Copy built files from build stage to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
