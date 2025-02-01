import express from "express";
import {
  adminLogin,
  adminLogout,
  adminSignup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  updateAdmin,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// =========== Admin Auth Routes ===========
router.get("/check-auth", verifyToken, checkAuth);
// Post /api/admin/auth/signup
router.post("/signup", adminSignup);

// Post /api/admin/auth/login
router.post("/login", adminLogin);

// Post /api/admin/auth/logout
router.post("/logout", adminLogout);

// Post /api/admin/auth/verify-email
router.post("/verify-email", verifyEmail);

// Post /api/admin/auth/forgot-password
router.post("/forgot-password", forgotPassword);
// Post /api/admin/auth/reset-password/:token

router.post("/reset-password/:token", resetPassword);

// Update admin details (protected route)
router.put('/update', verifyToken, updateAdmin);

export default router;
