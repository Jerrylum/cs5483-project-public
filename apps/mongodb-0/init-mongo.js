// This script initializes the MongoDB database with users and permissions
// It runs when the container is first started

// Get environment variables
const adminPassword = process.env.MONGO_ADMIN_PASSWORD;
const appUserPassword = process.env.MONGO_APP_USER_PASSWORD;
const readonlyUserPassword = process.env.MONGO_READONLY_USER_PASSWORD;
const dbName = process.env.MONGO_DATABASE_NAME || 'db0';

// Create database and sample collection
db = db.getSiblingDB(dbName);
db.createCollection('samples');
db.samples.insertOne({ 
  name: 'sample_document',
  createdAt: new Date(),
  description: 'This is a sample document created during initialization'
});

// Create application user with read/write permissions
db.createUser({
  user: 'app_user',
  pwd: appUserPassword,
  roles: [
    { role: 'readWrite', db: dbName }
  ]
});

// Create read-only user
db.createUser({
  user: 'readonly_user',
  pwd: readonlyUserPassword,
  roles: [
    { role: 'read', db: dbName }
  ]
});

print('MongoDB initialization completed successfully');
print('Created database: ' + dbName);
print('Created users: app_user, readonly_user');
print('Created collections: samples');