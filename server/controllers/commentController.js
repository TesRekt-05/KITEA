// controllers/commentController.js
import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";

// Add comment to a post
export const createComment = async (req, res) => {
  try {
    const { postId, content, userId } = req.body;

    // Validate required fields
    if (!postId || !content || !userId) {
      return res.status(400).json({
        success: false,
        message: "postId, content, and userId are required",
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create comment using YOUR field names
    const newComment = new Comment({
      post: postId,
      commenter: userId,
      content: content,
    });

    const savedComment = await newComment.save();

    // Populate user info for response
    await savedComment.populate("commenter", "userCount username");

    // Update user's comment count
    await User.findByIdAndUpdate(userId, {
      $inc: { commentsPosted: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Comment added successfully!",
      data: {
        commentId: savedComment._id,
        postId: savedComment.post,
        content: savedComment.content,
        commenter: savedComment.commenter,
        upvotes: savedComment.upvotes,
        downvotes: savedComment.downvotes,
        score: savedComment.getScore(),
        totalEngagement: savedComment.totalEngagement,
        createdAt: savedComment.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    });
  }
};

// Get all comments for a specific post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Get comments
    const comments = await Comment.find({
      post: postId,
      isActive: true,
    })
      .populate("commenter", "userCount username")
      .sort({ createdAt: -1 }) // Latest comments first
      .limit(50);

    // Add score and engagement to each comment
    const commentsWithScore = comments.map((comment) => ({
      commentId: comment._id,
      postId: comment.post,
      content: comment.content,
      commenter: comment.commenter,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      score: comment.getScore(),
      totalEngagement: comment.totalEngagement,
      createdAt: comment.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: {
        postId: postId,
        commentCount: comments.length,
        comments: commentsWithScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// Vote on comment (upvote/downvote) - WITH VOTE CHANGE ALLOWED
export const voteOnComment = async (req, res) => {
  try {
    const { commentId, voteType, userId } = req.body;

    // Validate input
    if (!commentId || !voteType || !userId) {
      return res.status(400).json({
        success: false,
        message: "commentId, voteType, and userId are required",
      });
    }

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'voteType must be either "upvote" or "downvote"',
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    //ALLOWS VOTE CHANGES
    if (!comment.votedBy) {
      comment.votedBy = [];
    }
    if (!comment.voteTypes) {
      comment.voteTypes = new Map(); // Track what type each user voted
    }

    const hasVoted = comment.votedBy.includes(userId);
    const previousVote = comment.voteTypes.get(userId);

    if (hasVoted && previousVote === voteType) {
      // Same vote type - block duplicate
      return res.status(400).json({
        success: false,
        message: `You have already ${voteType}d this comment`,
        alreadyVoted: true
      });
    }

    if (hasVoted && previousVote !== voteType) {
      // Different vote type - CHANGE VOTE
      console.log(`User changing vote from ${previousVote} to ${voteType}`);
      
      // Remove previous vote
      if (previousVote === "upvote") {
        comment.upvotes -= 1;
      } else {
        comment.downvotes -= 1;
      }
      
      // Add new vote
      if (voteType === "upvote") {
        comment.upvotes += 1;
      } else {
        comment.downvotes += 1;
      }
      
      // Update vote type
      comment.voteTypes.set(userId, voteType);
      
    } else {
      // First time voting
      comment.votedBy.push(userId);
      comment.voteTypes.set(userId, voteType);
      
      if (voteType === "upvote") {
        comment.upvotes += 1;
      } else {
        comment.downvotes += 1;
      }
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: hasVoted ? 
        `Vote changed to ${voteType} successfully!` : 
        `Comment ${voteType}d successfully!`,
      data: {
        commentId: comment._id,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        score: comment.getScore(),
        totalEngagement: comment.totalEngagement,
        voteAdded: voteType,
        voteChanged: hasVoted
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error voting on comment",
      error: error.message,
    });
  }
};


//delete comment - HARD DELETE
export const deleteComment = async (req, res) => {
  try {
    const { commentId, userId } = req.body;

    if (!commentId || !userId) {
      return res.status(400).json({
        success: false,
        message: "commentId and userId are required",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.commenter.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    const postId = comment.post;

    // HARD DELETE
    await Comment.findByIdAndDelete(commentId);
    console.log("Comment completely removed from database");

    // Update user's comment count
    await User.findByIdAndUpdate(userId, {
      $inc: { commentsPosted: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Comment permanently deleted",
      data: {
        deletedCommentId: commentId,
        postId: postId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};