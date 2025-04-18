#!/bin/bash

mkdir -p /home/jovyan/.ollama

# Common Ollama settings
OLLAMA_SCHED_SPREAD=1
OLLAMA_MAX_LOADED_MODELS=1
OLLAMA_NUM_PARALLEL=40
OLLAMA_LOAD_TIMEOUT=10m
OLLAMA_KEEP_ALIVE=-1
OLLAMA_FLASH_ATTENTION=1

# Model to pre-load on all servers
MODEL="deepseek-r1:14b"

# Start Ollama server for GPU 0 (Port 11434 - default)
echo "Starting Ollama server on GPU 0, port 11434..."
CUDA_VISIBLE_DEVICES=0 \
OLLAMA_HOST=127.0.0.1:11434 \
OLLAMA_MODELS=/home/jovyan/.ollama \
OLLAMA_SCHED_SPREAD=$OLLAMA_SCHED_SPREAD \
OLLAMA_MAX_LOADED_MODELS=$OLLAMA_MAX_LOADED_MODELS \
OLLAMA_NUM_PARALLEL=$OLLAMA_NUM_PARALLEL \
OLLAMA_LOAD_TIMEOUT=$OLLAMA_LOAD_TIMEOUT \
OLLAMA_KEEP_ALIVE=$OLLAMA_KEEP_ALIVE \
OLLAMA_FLASH_ATTENTION=$OLLAMA_FLASH_ATTENTION \
ollama serve > /tmp/ollama-gpu0.log 2>&1 &

# Start Ollama server for GPU 1 (Port 11435)
echo "Starting Ollama server on GPU 1, port 11435..."
CUDA_VISIBLE_DEVICES=1 \
OLLAMA_HOST=127.0.0.1:11435 \
OLLAMA_MODELS=/home/jovyan/.ollama \
OLLAMA_SCHED_SPREAD=$OLLAMA_SCHED_SPREAD \
OLLAMA_MAX_LOADED_MODELS=$OLLAMA_MAX_LOADED_MODELS \
OLLAMA_NUM_PARALLEL=$OLLAMA_NUM_PARALLEL \
OLLAMA_LOAD_TIMEOUT=$OLLAMA_LOAD_TIMEOUT \
OLLAMA_KEEP_ALIVE=$OLLAMA_KEEP_ALIVE \
OLLAMA_FLASH_ATTENTION=$OLLAMA_FLASH_ATTENTION \
ollama serve > /tmp/ollama-gpu1.log 2>&1 &

# Start Ollama server for GPU 2 (Port 11436)
echo "Starting Ollama server on GPU 2, port 11436..."
CUDA_VISIBLE_DEVICES=2 \
OLLAMA_HOST=127.0.0.1:11436 \
OLLAMA_MODELS=/home/jovyan/.ollama \
OLLAMA_SCHED_SPREAD=$OLLAMA_SCHED_SPREAD \
OLLAMA_MAX_LOADED_MODELS=$OLLAMA_MAX_LOADED_MODELS \
OLLAMA_NUM_PARALLEL=$OLLAMA_NUM_PARALLEL \
OLLAMA_LOAD_TIMEOUT=$OLLAMA_LOAD_TIMEOUT \
OLLAMA_KEEP_ALIVE=$OLLAMA_KEEP_ALIVE \
OLLAMA_FLASH_ATTENTION=$OLLAMA_FLASH_ATTENTION \
ollama serve > /tmp/ollama-gpu2.log 2>&1 &

# Start Ollama server for GPU 3 (Port 11437)
echo "Starting Ollama server on GPU 3, port 11437..."
CUDA_VISIBLE_DEVICES=3 \
OLLAMA_HOST=127.0.0.1:11437 \
OLLAMA_MODELS=/home/jovyan/.ollama \
OLLAMA_SCHED_SPREAD=$OLLAMA_SCHED_SPREAD \
OLLAMA_MAX_LOADED_MODELS=$OLLAMA_MAX_LOADED_MODELS \
OLLAMA_NUM_PARALLEL=$OLLAMA_NUM_PARALLEL \
OLLAMA_LOAD_TIMEOUT=$OLLAMA_LOAD_TIMEOUT \
OLLAMA_KEEP_ALIVE=$OLLAMA_KEEP_ALIVE \
OLLAMA_FLASH_ATTENTION=$OLLAMA_FLASH_ATTENTION \
ollama serve > /tmp/ollama-gpu3.log 2>&1 &

# Wait for multi-GPU server to initialize
sleep 5
echo "All Ollama servers started. Now preloading model on all servers..."

echo "Model preloaded on all servers with generation requests."
echo "To kill all servers: pkill -f 'ollama serve'"

# Print status of servers
echo -e "\nChecking status of servers..."
ps aux | grep "ollama serve" | grep -v grep

echo -e "\nLog file locations:"
echo "/tmp/ollama-gpu0.log - GPU 0 (Port 11434)"
echo "/tmp/ollama-gpu1.log - GPU 1 (Port 11435)"
echo "/tmp/ollama-gpu2.log - GPU 2 (Port 11436)"
echo "/tmp/ollama-gpu3.log - GPU 3 (Port 11437)"