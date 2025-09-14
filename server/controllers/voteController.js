import Post from "../models/postModel.js";
import User from "../models/userModel.js";

// controllers/voteController.js - UPDATED with flag change support
export const voteOnPost = async (req, res) => {
  try {
    const { postId, voteType, userId } = req.body;

    // Validate required fields
    if (!postId || !voteType || !userId) {
      return res.status(400).json({
        success: false,
        message: "postId, voteType, and userId are required",
      });
    }

    // Validate vote type - ONLY RED/GREEN FLAGS
    const validVoteTypes = ["redFlag", "greenFlag"];
    if (!validVoteTypes.includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'voteType must be either "redFlag" or "greenFlag"',
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

    // ALLOWS FLAG CHANGES
    if (!post.votedBy) {
      post.votedBy = [];
    }
    if (!post.flagTypes) {
      post.flagTypes = new Map();
    }

    const hasVoted = post.votedBy.includes(userId);
    const previousFlag = post.flagTypes.get(userId);

    if (hasVoted && previousFlag === voteType) {
      // Same flag type - block duplicate
      return res.status(400).json({
        success: false,
        message: `You have already ${
          voteType === "redFlag" ? "red flagged" : "green flagged"
        } this person`,
        alreadyVoted: true,
      });
    }

    if (hasVoted && previousFlag !== voteType) {
      // Different flag type - CHANGE FLAG
      console.log(`User changing flag from ${previousFlag} to ${voteType}`);

      // Remove previous flag
      if (previousFlag === "redFlag") {
        post.votes.redFlags -= 1;
      } else {
        post.votes.greenFlags -= 1;
      }

      // Add new flag
      if (voteType === "redFlag") {
        post.votes.redFlags += 1;
      } else {
        post.votes.greenFlags += 1;
      }

      // Update flag type
      post.flagTypes.set(userId, voteType);
    } else {
      // First time voting
      post.votedBy.push(userId);
      post.flagTypes.set(userId, voteType);

      if (voteType === "redFlag") {
        post.votes.redFlags += 1;
      } else {
        post.votes.greenFlags += 1;
      }
    }

    // Update total votes
    await post.updateTotalVotes();

    res.status(200).json({
      success: true,
      message: hasVoted
        ? `Flag changed to ${
            voteType === "redFlag" ? "red flag" : "green flag"
          } successfully!`
        : `${
            voteType === "redFlag" ? "Red flag" : "Green flag"
          } added successfully!`,
      data: {
        postId: post._id,
        personName: post.personName,
        votes: {
          redFlags: post.votes.redFlags,
          greenFlags: post.votes.greenFlags,
          totalVotes: post.votes.totalVotes,
        },
        flagAdded: voteType,
        flagChanged: hasVoted,
        safetyScore: post.votes.greenFlags - post.votes.redFlags,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding flag to post",
      error: error.message,
    });
  }
};

// Get flag statistics for a post
export const getPostFlags = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Calculate percentages and safety score
    const total = post.votes.totalVotes || 1;
    const statistics = {
      redFlagPercentage: Math.round((post.votes.redFlags / total) * 100),
      greenFlagPercentage: Math.round((post.votes.greenFlags / total) * 100),
      safetyScore: post.votes.greenFlags - post.votes.redFlags,
      safetyRating:
        post.votes.greenFlags > post.votes.redFlags
          ? "SAFE"
          : post.votes.redFlags > post.votes.greenFlags
          ? "WARNING"
          : "NEUTRAL",
    };

    res.status(200).json({
      success: true,
      message: "Flag statistics retrieved successfully",
      data: {
        postId: post._id,
        personName: post.personName,
        flags: {
          redFlags: post.votes.redFlags,
          greenFlags: post.votes.greenFlags,
          totalFlags: post.votes.totalVotes,
        },
        statistics: statistics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching flag statistics",
      error: error.message,
    });
  }
};

// Get safest people (most green flags)
export const getSafestPeople = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const safestPosts = await Post.find({ isActive: true })
      .populate("uploadedBy", "userCount username")
      .sort({
        "votes.greenFlags": -1, // Most green flags first
        "votes.redFlags": 1, // Least red flags second
        createdAt: -1, // Then by newest
      })
      .limit(parseInt(limit));

    const postsWithSafetyScores = safestPosts.map((post) => ({
      postId: post._id,
      personName: post.personName,
      caption: post.caption,
      photo: post.photo,
      uploadedBy: post.uploadedBy,
      flags: {
        redFlags: post.votes.redFlags,
        greenFlags: post.votes.greenFlags,
        totalFlags: post.votes.totalVotes,
      },
      safetyScore: post.votes.greenFlags - post.votes.redFlags,
      safetyRating:
        post.votes.greenFlags > post.votes.redFlags
          ? "SAFE"
          : post.votes.redFlags > post.votes.greenFlags
          ? "WARNING"
          : "NEUTRAL",
      createdAt: post.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Safest people retrieved successfully",
      data: {
        posts: postsWithSafetyScores,
        count: postsWithSafetyScores.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching safest people",
      error: error.message,
    });
  }
};
