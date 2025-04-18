FROM oven/bun:1 AS runner

WORKDIR /app

# Copy package files and install dependencies
COPY index.ts .
COPY package.json .
COPY tsconfig.json .
RUN bun install

# Create a directory for cookies storage with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["bun", "start"]