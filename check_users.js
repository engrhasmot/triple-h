const mongoose = require('mongoose');

async function checkUsers() {
  await mongoose.connect('mongodb://127.0.0.1:27017/triple-h-db');
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('Users:', users);
  process.exit(0);
}

checkUsers().catch(console.error);
