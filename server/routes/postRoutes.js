import express from "express";
import upload from "../middlewares/upload.js";
import {
  createPost,
  getAllPosts,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// // Debug route - test if routes are connected
// router.get('/test', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Post routes are working!',
//     timestamp: new Date().toISOString()
//   });
// });

// This should match: POST /api/posts/create
router.post("/create", upload.single("photo"), createPost);

// This should match: GET /api/posts
router.get("/", getAllPosts);

//delete route
router.delete("/delete", deletePost);

console.log("Post routes loaded successfully"); // Debug line

export default router;
