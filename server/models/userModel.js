import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // User count - auto-incrementing ID
  userCount: {
    type: Number,
    unique: true,
  },
  
  // Anonymous credentials - auto-generated
  username: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  password: {
    type: String,
    unique: true,
    required: true,
    select: false
  },
  
  // User status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Track usage for stats
  commentsPosted: {
    type: Number,
    default: 0
  },
  
  // Engagement stats
  totalUpvotes: {
    type: Number,
    default: 0
  },
  totalDownvotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate UNIQUE random username and password
userSchema.statics.generateCredentials = function() {
  const username = 'user_' + crypto.randomBytes(2).toString('hex');
  const password = crypto.randomBytes(4).toString('hex');
  return { username, password };
};

// Auto-increment userCount before saving
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Get the highest userCount and increment by 1
      const lastUser = await this.constructor.findOne({}, {}, { sort: { 'userCount': -1 } });
      this.userCount = lastUser ? lastUser.userCount + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Simple password comparison
userSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

export default mongoose.model('User', userSchema);
