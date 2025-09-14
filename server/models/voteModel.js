import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  // What is being voted on
  targetType: {
    type: String,
    enum: ['post', 'comment'], // Can vote on posts or comments
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType' // References Post or Comment based on targetType
  },
  
  // Who voted
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // What type of vote
  voteType: {
    type: String,
    enum: ['upvote', 'downvote', 'redFlag', 'greenFlag'],
    required: true
  }
}, {
  timestamps: true
});

// CRITICAL: Prevent duplicate votes from same user on same target
voteSchema.index({ targetType: 1, targetId: 1, voter: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);
