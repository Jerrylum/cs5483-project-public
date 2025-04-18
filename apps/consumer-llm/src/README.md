# Multi-GPU Ollama Setup

This document explains how to configure and run multiple Ollama servers, each bound to a specific GPU.

## Prerequisites

- A machine with multiple GPUs (this setup is configured for 4 GPUs)
- Ollama installed on the system
- CUDA drivers properly installed

## Setup and Configuration

### 1. Run Multiple Ollama Servers

The `run-all-ollama-server.sh` script will start four Ollama server instances, each bound to a different GPU:

```bash
# Make the script executable
chmod +x run-all-ollama-server.sh

# Run the script
./run-all-ollama-server.sh
```

The script will:

- Create separate directories for each Ollama instance
- Start four Ollama servers on ports 11434, 11435, 11436, and 11437
- Bind each server to a specific GPU using CUDA_VISIBLE_DEVICES
- Redirect logs to /tmp/ollama-gpu\*.log files
- Run all servers in the background

### 2. Check Server Status

After running the script, you can check if all servers are running:

```bash
ps aux | grep "ollama serve" | grep -v grep
```

You can also check the logs for each server:

```bash
tail -f /tmp/ollama-gpu0.log
tail -f /tmp/ollama-gpu1.log
tail -f /tmp/ollama-gpu2.log
tail -f /tmp/ollama-gpu3.log
```

### 3. Stopping All Servers

To stop all Ollama servers:

```bash
pkill -f 'ollama serve'
```

## How It Works

1. Each Ollama server is bound to a specific GPU using the `CUDA_VISIBLE_DEVICES` environment variable
2. Each server listens on a different port (11434, 11435, 11436, 11437)
3. Each server uses a dedicated directory for models
4. The application (`llm.ts`) distributes requests across all servers in a round-robin fashion

## Troubleshooting

If you encounter issues:

1. Check the log files in `/tmp/ollama-gpu*.log`
2. Make sure the GPU devices are properly recognized with `nvidia-smi`
3. Ensure each server has the required models pulled (you may need to run `ollama pull` for each server separately)

To pull models for each server, you can use commands like:

```bash
# For GPU 0 (default port)
ollama pull deepseek-r1:14b

# For other GPUs, specify the host
OLLAMA_HOST=127.0.0.1:11435 ollama pull deepseek-r1:14b
OLLAMA_HOST=127.0.0.1:11436 ollama pull deepseek-r1:14b
OLLAMA_HOST=127.0.0.1:11437 ollama pull deepseek-r1:14b
```
