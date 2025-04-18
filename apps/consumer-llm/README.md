# Consumer LLM

This is a consumer service that processes feature engineering tasks using LLM (Large Language Model) capabilities. It connects to a master server to receive and process tasks related to feature engineering.

## Prerequisites

- Bun (v1.2.5 or higher)
- Ollama running locally (for LLM processing)

## Installation

1. Navigate to the project directory:

```bash
cd apps/consumer-llm
```

2. Install dependencies:

```bash
bun install
```

3. Create a .env file with your consumer name:

```bash
echo "CONSUMER_NAME=consumer-llm" > .env
```

Note: You can replace "consumer-llm" with any unique identifier you want to use for this consumer instance.

## Running the Consumer

### Development Mode

To run the consumer in development mode with hot reloading:

```bash
bun run dev
```

### Production Mode

Since Docker is not available in the production environment, we use `nohup` to run the consumer in the background:

```bash
nohup bun run start > consumer-llm.log 2>&1 &
```

This command will:

- Start the consumer in the background
- Redirect both stdout and stderr to `consumer-llm.log`
- The `&` at the end makes it run in the background
- The process ID will be displayed after running the command

## Managing the Process

### Viewing Logs

To view the logs in real-time:

```bash
tail -f consumer-llm.log
```

To view the last 100 lines of logs:

```bash
tail -n 100 consumer-llm.log
```

### Finding the Process ID

To find the process ID of the running consumer:

```bash
ps aux | grep "bun.*consumer-llm"
```

### Stopping the Consumer

To stop the consumer, you'll need to kill the process. Here are two methods:

1. Using the process ID (PID):

```bash
kill <PID>
```

2. Using the process name:

```bash
pkill -f "bun.*consumer-llm"
```

For a graceful shutdown, first try the regular `kill` command. If the process doesn't stop, you can force kill it using:

```bash
kill -9 <PID>
```

## Configuration

The consumer connects to the master server at `cs5483-24-g1.jerryio.com`. Make sure this server is accessible before starting the consumer.

### Environment Variables

The consumer requires the following environment variables in a `.env` file:

- `CONSUMER_NAME`: The unique identifier for this consumer instance (required)

Example `.env` file:

```
CONSUMER_NAME=consumer-llm
```

## Troubleshooting

1. If the consumer is not starting, check:

   - The Ollama service is running
   - The master server is accessible
   - The log file for any error messages

2. If the consumer is not processing tasks:
   - Check the connection to the master server
   - Verify the consumer name matches the expected value
   - Check the logs for any error messages

## Notes

- The consumer runs with a maximum of 10 concurrent tasks
- If no tasks are available, it will wait 5 seconds before checking again
- The consumer automatically handles task cleanup and error reporting
