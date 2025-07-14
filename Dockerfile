# Use Node.js 24.1.0 LTS base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file first for caching
COPY package*.json ./

# Install Dependencies
RUN npm install

COPY . .

# Optional: set environment variables (better to pass at runtime or use dotenv)
ENV NODE_ENV=production

# Start the bot
CMD ["node", "src/shard.js"]