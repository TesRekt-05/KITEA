import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // Which post is being commented on
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  
  // Who commented (anonymous user)
  commenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Comment content
  content: {
    type: String,
    required: true,
    maxlength: 300,
    trim: true
  },
  
  // Comment engagement (people can upvote/downvote comments)
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Method to calculate net score (upvotes - downvotes)
commentSchema.methods.getScore = function() {
  return this.upvotes - this.downvotes;
};

// Virtual for total engagement
commentSchema.virtual('totalEngagement').get(function() {
  return this.upvotes + this.downvotes;
});

// Add this after your schema definition
commentSchema.index({ post: 1, createdAt: -1 }); // Faster queries by post


export default mongoose.model('Comment', commentSchema);
