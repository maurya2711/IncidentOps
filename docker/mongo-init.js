db.createUser({
  user: 'incidentops_user',
  pwd: 'incidentops_password',
  roles: [
    {
      role: 'readWrite',
      db: 'incidentops',
    },
  ],
});

db = db.getSiblingDB('incidentops');

db.createCollection('users');
db.createCollection('incidents');
db.createCollection('services');
db.createCollection('teams');
db.createCollection('notifications');
db.createCollection('apikeys');
db.createCollection('sessions');

print('MongoDB initialized for IncidentOps');
