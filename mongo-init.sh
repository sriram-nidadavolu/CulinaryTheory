set -e

mongosh <<EOF
use $MONGO_INITDB_DATABASE

db.createUser({
  user: '$MONGO_INITDB_USER',
  pwd: '$MONGO_INITDB_PWD',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_INITDB_DATABASE'
  }]
})

db.createCollection("users");
db.users.insert({"user_id": "root-user", "email":"theculinarytheory@gmail.com", "password":"", "role":"superadmin", "salt":""})
EOF
