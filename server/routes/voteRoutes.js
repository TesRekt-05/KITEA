// routes/voteRoutes.js
import express from "express";
import {
  voteOnPost,
  getPostFlags,
  getSafestPeople,
} from "../controllers/voteController.js";

const router = express.Router();

// POST /api/votes/post - Add red/green flag to a post
router.post("/post", voteOnPost);

// GET /api/votes/post/:postId - Get flag statistics for a post
router.get("/post/:postId", getPostFlags);

// GET /api/votes/safest - Get safest people (most green flags)
router.get("/safest", getSafestPeople);

console.log("Vote routes loaded successfully");

export default router;
