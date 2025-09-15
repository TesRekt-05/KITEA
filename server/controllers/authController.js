// controllers/authController.js
import User from "../models/userModel.js";

export const createUser = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const { username, password } = User.generateCredentials();

    const newUser = new User({
      username: username,
      password: password,
    });

    const savedUser = await newUser.save();

    res.status(200).json({
      success: true,
      message: "User created successfully",
      data: {
        userId: savedUser._id,
        _id: savedUser._id,
        userCount: savedUser.userCount,
        username: savedUser.username,
        password: password,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username",
      });
    }

    const isValidPassword = user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id,
        id: user._id,
        userCount: user.userCount,
        username: user.username, // Flutter needs this
        isActive: user.isActive,
        commentsPosted: user.commentsPosted,
        totalUpvotes: user.totalUpvotes,
        totalDownvotes: user.totalDownvotes,
        // Add token later if needed: token: "jwt_token_here"
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};
