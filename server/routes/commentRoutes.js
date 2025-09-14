import express from "express";
import {
  createComment,
  getCommentsByPost,
  voteOnComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// POST /api/comments/create - Add comment to post
router.post("/create", createComment);

// GET /api/comments/post/:postId - Get all comments for a post
router.get("/post/:postId", getCommentsByPost);

// POST /api/comments/vote - Vote on comment
router.post("/vote", voteOnComment);

//delete comment route
router.delete("/delete", deleteComment);

console.log("Comment routes loaded successfully");

export default router;
