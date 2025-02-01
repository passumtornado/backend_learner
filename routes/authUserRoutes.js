import express from "express";
import {
  verifyEmail,
  forgotPassword,
  resetPassword,
  userSignup,
  userLogin,
  userLogout,
} from "../controllers/authUserController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

//============Learner Auth Routes================
// Post /api/learner/auth/user-signup
router.post("/signup", userSignup);

// Post /api/learner/auth/signin
router.post("/signin", userLogin);

// Post /api/admin/auth/signout
router.post("/logout", userLogout);

// Post /api/admin/auth/verify-email
router.post("/verify-email", verifyEmail);

// Post /api/admin/auth/forgot-password
router.post("/forgot-password", forgotPassword);
// Post /api/admin/auth/reset-password/:token

router.post("/reset-password/:token", resetPassword);

export default router;