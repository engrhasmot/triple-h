const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true } // Make sure we can select it
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testPassword() {
  await mongoose.connect('mongodb://127.0.0.1:27017/triple-h-db');
  
  const user = await User.findOne({ email: 'admin@tripleh.com.bd' });
  if (!user) {
    console.log('User not found!');
    process.exit(1);
  }
  
  console.log('DB Password:', user.password);
  
  const isMatch = await bcrypt.compare('admin123', user.password);
  console.log('admin123 Match:', isMatch);
  
  process.exit(0);
}

testPassword().catch(console.error);
