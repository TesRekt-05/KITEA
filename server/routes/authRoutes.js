import express from "express";
import { createUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/create-user
router.post("/create-user", createUser);

// POST /api/auth/login
router.post("/login", loginUser);

export default router;
