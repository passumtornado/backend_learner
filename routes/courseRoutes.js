import express from "express";
import { checkAuth } from "../controllers/authController.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();



// Create a new course (protected route)
router.post("/",verifyToken, createCourse);

// Get all courses (protected route)
router.get("/", verifyToken,getCourses);

// Get a course by ID (protected route)
router.get("/:id",verifyToken,getCourseById);

// Update a course by ID (protected route)
router.put("/:id",verifyToken, updateCourse);

// Delete a course by ID (protected route)
router.delete("/:id",verifyToken, deleteCourse);

export default router;
