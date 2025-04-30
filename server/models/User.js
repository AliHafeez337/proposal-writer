const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({ // User Schema
  email: { // User email
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { // User password
    type: String,
    required: true
  },
  createdAt: { // Date of creation
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  delete user.createdAt;
  delete user.__v; // Remove version key
  return user;
}

module.exports = mongoose.model('User', UserSchema);