// server.js
import express from "express";
import { connectDB } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "College Tea sharing App API",
    endpoints: {
      // Auth endpoints
      createUser: "POST /api/auth/create-user",
      login: "POST /api/auth/login",

      // Post endpoints
      createPost: "POST /api/posts/create",
      getAllPosts: "GET /api/posts",
      deletePost: "DELETE /api/posts/delete",

      // Comment endpoints
      createComment: "POST /api/comments/create",
      getComments: "GET /api/comments/post/:postId",
      voteOnComment: "POST /api/comments/vote",
      deleteComment: "DELETE /api/comments/delete",

      // Vote endpoints ← ADD THESE
      flagPerson: "POST /api/votes/post",
      getPersonFlags: "GET /api/votes/post/:postId",
      getSafestPeople: "GET /api/votes/safest",
    },
  });
});

// Error handling
app.use("/{*catchAll}", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Comment system ready!");
});
