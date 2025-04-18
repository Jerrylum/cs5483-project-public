FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --production

# Copy source files
COPY src ./src
COPY tsconfig.json ./
COPY .env ./

# Expose the port
EXPOSE 8000

# The command to run
CMD ["bun", "run", "src/index.ts"]