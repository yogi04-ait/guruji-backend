# Use lightweight Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy remaining files
COPY . .

# Expose backend port
EXPOSE 5000

# Start app
CMD ["node", "src/index.js"]