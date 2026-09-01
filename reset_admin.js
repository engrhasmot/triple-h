const mongoose = require('mongoose');

// We copy the schema here just to be able to create the user directly in Node
const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String },
    isActive: { type: Boolean },
  }
);
const User = mongoose.model('User', UserSchema);

async function resetAdmin() {
  await mongoose.connect('mongodb://127.0.0.1:27017/triple-h-db');
  
  await User.deleteMany({ email: 'admin@tripleh.com.bd' });
  console.log('Deleted old admin user.');

  await User.create({
    name: 'Admin',
    email: 'admin@tripleh.com.bd',
    // Hash for 'admin123'
    password: '$2a$10$0s3SI9qWF/EWDLtRTmGUwOQWduBF/uBLDKs9M8dl2j9N.4BjCpMhS',
    role: 'admin',
    isActive: true,
  });
  console.log('Created new admin user with password admin123.');

  process.exit(0);
}

resetAdmin().catch(console.error);
