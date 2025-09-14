import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import cloudinary from "../cloudinary.js";
import fs from "fs";

// Upload helper function
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "KITEA-APP-POSTS", // Organize in folder
      resource_type: "auto",
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    // Delete local file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

// Create new post with photo
export const createPost = async (req, res) => {
  try {
    const { personName, caption, userId } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a photo",
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      // Delete uploaded file if user doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path);

    // Create post
    const newPost = new Post({
      photo: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      },
      personName: personName,
      caption: caption,
      uploadedBy: userId,
    });

    const savedPost = await newPost.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "Post created successfully!",
      data: {
        postId: savedPost._id,
        personName: savedPost.personName,
        caption: savedPost.caption,
        photo: savedPost.photo,
        uploadedBy: savedPost.uploadedBy,
        votes: savedPost.votes,
        createdAt: savedPost.createdAt,
      },
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};

// Get all posts (feed)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true })
      .populate("uploadedBy", "userCount username")
      .sort({ createdAt: -1 }) // Latest first
      .limit(20); // Limit for performance

    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message,
    });
  }
};
