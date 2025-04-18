#!/bin/zsh

# Create backup directory if it doesn't exist
mkdir -p ~/backup

# Get current date for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR=~/backup/mongodb_backup_$TIMESTAMP

# Load environment variables from .env file if it exists
if [ -f "apps/mongodb-0/.env" ]; then
    source apps/mongodb-0/.env
elif [ -f ".env" ]; then
    source .env
fi

# Set default admin username if not defined
MONGO_ADMIN_USERNAME=${MONGO_ADMIN_USERNAME:-admin}

echo "MONGO_ADMIN_USERNAME: $MONGO_ADMIN_USERNAME"
echo "MONGO_ADMIN_PASSWORD: $MONGO_ADMIN_PASSWORD"

# Create the backup using mongodump inside the container
docker exec mongodb-0 bash -c "mongodump --host localhost --port 27017 -u $MONGO_ADMIN_USERNAME -p $MONGO_ADMIN_PASSWORD --authenticationDatabase admin --db db0 --out /tmp/backup"

# Copy the backup from container to host
docker cp mongodb-0:/tmp/backup $BACKUP_DIR

# Clean up temporary backup files in the container
docker exec mongodb-0 rm -rf /tmp/backup

echo "MongoDB backup completed: $BACKUP_DIR" 