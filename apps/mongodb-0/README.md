# MongoDB Database for CS5483 Project

This directory contains the MongoDB database setup for the CS5483 project. The database is containerized using Docker and MongoDB Community Server.

## Features

- MongoDB Community Server (latest version)
- Secure authentication with admin user
- Additional users with different permission levels:
  - `app_user`: Read and write access to the project database
  - `readonly_user`: Read-only access to the project database
- Persistent data storage using Docker volumes
- Health checks to ensure database availability
- Resource limits to prevent container overload
- Port 27017 exposed to localhost for easy access from other applications

## Prerequisites

- Docker and Docker Compose installed on your system
- Basic understanding of MongoDB and Docker

## Setup Instructions

1. **Clone the repository** (if you haven't already)

2. **Configure environment variables**
   ```bash
   cd apps/mongodb-0
   cp .env.example .env
   ```
   
   Edit the `.env` file and replace the placeholder passwords with strong, secure passwords.

3. **Create Docker volumes for persistent storage**
   
   **For Development Environment:**
   ```bash
   # Create a Docker volume that maps to a local directory
   mkdir -p ./data
   docker volume create --name mongodb_data --opt type=none --opt device=$(pwd)/data --opt o=bind
   ```
   
   **For Production Environment:**
   ```bash
   # Create a Docker volume that maps to a persistent directory
   mkdir -p $HOME/database/cs5484-project-mongodb-0-data
   docker volume create --name mongodb_data --opt type=none --opt device=$HOME/database/cs5484-project-mongodb-0-data --opt o=bind
   ```

4. **Start the MongoDB container**
   ```bash
   docker-compose up -d
   ```

5. **Verify the container is running**
   ```bash
   docker-compose ps
   ```

6. **Check the logs**
   ```bash
   docker-compose logs
   ```

7. **Verify MongoDB is accessible on localhost**
   ```bash
   # Using mongosh (if installed)
   # If you do not have mongosh installed, visit https://www.mongodb.com/docs/mongodb-shell/install/
   mongosh --port 27017
   
   # Or using telnet
   telnet localhost 27017
   
   # Or using nc (netcat)
   nc -zv localhost 27017
   ```

## Connection Information

- **Host**: localhost (or your server IP)
- **Port**: 27017
- **Admin Username**: admin
- **Admin Password**: As specified in your .env file
- **Connection String (for admin)**: `mongodb://admin:password@localhost:27017/admin`
- **Connection String (for app user)**: `mongodb://app_user:password@localhost:27017/db0`
- **Connection String (for read-only user)**: `mongodb://readonly_user:password@localhost:27017/db0`

## Database Structure

The initialization script creates:
- A database called `db0`
- A sample collection called `samples` with one document

## Managing the Database

### Starting and Stopping

```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# Stop the database and remove volumes (CAUTION: This will delete all data)
docker-compose down -v
```

### Accessing the MongoDB Shell

```bash
# As admin
docker exec -it mongodb-0 mongosh -u admin -p <your_admin_password>

# As app_user
docker exec -it mongodb-0 mongosh -u app_user -p <your_app_user_password> db0

# As readonly_user
docker exec -it mongodb-0 mongosh -u readonly_user -p <your_readonly_password> db0
```

### Backing Up and Restoring Data

```bash
# Backup
docker exec -it mongodb-0 mongodump --username admin --password <your_admin_password> --authenticationDatabase admin --db db0 --out /data/db/backup

# Copy backup files from container to host
docker cp mongodb-0:/data/db/backup ./backup

# Restore
docker cp ./backup mongodb-0:/data/db/backup
docker exec -it mongodb-0 mongorestore --username admin --password <your_admin_password> --authenticationDatabase admin /data/db/backup
```

## Troubleshooting

- **Container fails to start**: Check the logs with `docker-compose logs mongodb-0`

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Docker Compose Documentation](https://docs.docker.com/compose/)