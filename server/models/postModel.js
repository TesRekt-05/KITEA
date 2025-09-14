// models/Post.js (combines Person + Post functionality)
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  // Photo details (Cloudinary)
  photo: {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  },
  
  // Person being posted about
  personName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  // Caption by the uploader 
  caption: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  
  // Who uploaded this post
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Voting system (combined from Person model)
  votes: {
    // // Post engagement
    // upvotes: { type: Number, default: 0 },
    // downvotes: { type: Number, default: 0 },
    
    // Person flags (red flag/green flag about the person)
    redFlags: { type: Number, default: 0 },
    greenFlags: { type: Number, default: 0 },
    
    totalVotes: { type: Number, default: 0 }
  },
  
  // // Rating system (for the person)
  // ratings: {
  //   total: { type: Number, default: 0 },
  //   count: { type: Number, default: 0 },
  //   average: { type: Number, default: 0 }
  // },
  
  // Post status
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// // Method to update average rating
// postSchema.methods.updateAverageRating = function() {
//   if (this.ratings.count > 0) {
//     this.ratings.average = this.ratings.total / this.ratings.count;
//   }
//   return this.save();
// };

// Method to update total votes
postSchema.methods.updateTotalVotes = function() {
  this.votes.totalVotes = this.votes.redFlags + this.votes.greenFlags;
  return this.save();
};

export default mongoose.model('Post', postSchema);
