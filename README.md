# CS5483 GitHub Pull Request Analysis Project

This project is a comprehensive system for analyzing GitHub pull requests using machine learning and large language models (LLMs). It extracts, processes, and analyzes data from GitHub repositories to generate insights about pull request patterns and characteristics.

## Project Overview

The system is designed with a microservices architecture consisting of:

- A master server that coordinates tasks and data flow
- Consumer services that process specific tasks (e.g., LLM-based feature engineering)
- MongoDB database for persistent storage
- Various processing stages for data mining, analysis, and visualization

## Components

### Master Server (master-0)

Central coordination server that:
- Manages task queue and distribution
- Handles API endpoints for task submission and responses
- Coordinates data flow between consumers and database

### Consumer (GitHub api / code diff / LLM features)

A service that processes feature engineering tasks using large language models:
- Connects to the master server to retrieve tasks
- Uses Ollama for local LLM processing
- Generates features based on PR content, code changes, and comments

### MongoDB Database

Stores all project data:
- Pull request information
- Feature engineering results
- Task status and history
- Analytics data

### Processing Stages

- **Data Mining**: Collection of GitHub repository data
- **Data Visualization**: Tools for visualizing analysis results

## Setup Instructions

### Prerequisites

- Bun v1.2.5 or higher
- Node.js and npm
- Docker and Docker Compose (for MongoDB)
- Ollama (for local LLM processing)

## Project Structure

- `apps/`: Long term running services
  - `cloudflared/`: Cloudflare worker for API gateway
  - `consumer`: Consumer for GitHub api requests
  - `consumer-code/`: Consumer for GitHub api code diffs
  - `consumer-llm/`: LLM-based feature engineering service
  - `group-project-server-keepalive-helper`: Helper for keeping the server alive
  - `master-0/`: Central task coordination server
  - `mongodb-0/`: Database service
  - `optuna-dashboard/`: Optuna dashboard for hyperparameter tuning
  - `statistics/`: Statistics service
- `data/`: Collected data
- `results/`: Analysis results
- `stages/`: Processing stages
    - `data-mining/`: GitHub data collection tools
    - `data-visualization/`: Analytics visualization
    - `in-python`: Python-based processing stages
    - `in-typescript`: TypeScript-based processing stages
    - `sandbox-in-python/`: Development playground
    - `sandbox-in-typescript/`: Development playground
- `util/`: Shared utilities


