const mongoose = require('mongoose');

async function updateAdmin() {
  await mongoose.connect('mongodb://127.0.0.1:27017/triple-h-db');
  const res = await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@tripleh.com.bd' },
    { $set: { password: '$2a$10$0s3SI9qWF/EWDLtRTmGUwOQWduBF/uBLDKs9M8dl2j9N.4BjCpMhS' } }
  );
  console.log('Updated:', res.modifiedCount);
  process.exit(0);
}

updateAdmin().catch(console.error);
