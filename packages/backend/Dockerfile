# Production build for backend with PM2 process manager
FROM node:20-alpine

WORKDIR /app

# Install PM2 globally for process management
RUN npm install -g pm2

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Create logs directory
RUN mkdir -p logs

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to the nodejs user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
