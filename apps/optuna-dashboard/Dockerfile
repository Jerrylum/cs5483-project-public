FROM python:3.9-slim

WORKDIR /app

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN pip install --no-cache-dir optuna optuna-dashboard

# Set Python to run in unbuffered mode
ENV PYTHONUNBUFFERED=1

# Command to run the dashboard
CMD ["optuna-dashboard", "sqlite:////app/result.sqlite3", "--host", "0.0.0.0", "--port", "8080"]