# Group Project Server Keepalive Helper

A utility to automatically refresh the CS5483 group project server page and maintain the session, built with TypeScript, Selenium WebDriver, Chrome, and Bun.

## Features

- Automatically refreshes the group project server page every 50 minutes
- Monitors server status and sends notifications
- Integrates with Discord for status notifications
- Handles login when required (but doesn't store credentials)
- Stores session cookies for persistence
- Dockerized with separate Selenium container for reliable browser automation
- Built with TypeScript, Selenium, and Bun

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

## Production Deployment

The application is Dockerized with a two-container setup using Docker Compose:

1. Configure Discord webhook (optional):

```bash
# Edit the .env file to add your Discord webhook URL
echo "DISCORD_WEBHOOK_URL=your_discord_webhook_url" > .env
```

2. Build and start the containers in the background:

```bash
docker compose build # if the image is not up to date
docker compose up -d
```

This will start two containers:

- The application container running the keepalive service
- A Selenium container with Chrome for browser automation

3. Attach to the container to see the status and input credentials when prompted:

```bash
docker attach group-project-server-keepalive
```

4. When prompted, enter your username and password (these are not stored)

The application will continue running in the background, refreshing the page every 4 minutes. The session cookies are stored in the `data` directory (mapped as a volume in the container).

## Viewing the Browser (Optional)

The Selenium container includes noVNC that allows you to see what's happening in the browser in real-time. Open your web browser and go to:

```
http://localhost:7900/?autoconnect=1&resize=scale&password=secret
```

## Stop the Service

To stop all services:

```bash
docker compose down
```

## Configuration

Key configuration options:

- `URL`: The URL to refresh (default: 'https://dive.cs.cityu.edu.hk/cs5483_24b/user/group1/lab/tree/RTC%3A')
- `REFRESH_INTERVAL`: Time between refreshes in milliseconds (default: 4 minutes)
- `SELENIUM_REMOTE_URL`: URL of the Selenium server (default: http://selenium:4444 in Docker, http://localhost:4444 for local development)
- `DISCORD_WEBHOOK_URL`: Discord webhook URL for notifications (optional)
