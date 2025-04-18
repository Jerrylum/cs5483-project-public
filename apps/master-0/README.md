# Master-0 API Server

A TypeScript-based API server using Bun and Elysia.

## Prerequisites

- [Bun](https://bun.sh/) runtime
- VS Code with Remote Containers extension (for devcontainer support)

## Getting Started

1. Open the project in VS Code and reopen in container when prompted
2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

The server will start on port 2000.

## Available Scripts

- `bun run dev` - Start the development server with hot reload
- `bun run start` - Start the production server
- `bun run build` - Build the project for production

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Development

The project uses TypeScript and is set up with:

- ESNext module system
- Strict TypeScript checking
- Hot reload during development
- CORS support

## Container Development

The project includes a devcontainer configuration for consistent development environments. The container includes:

- Bun runtime
- Node.js
- TypeScript support
- ESLint
