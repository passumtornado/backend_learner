import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createLearner,
  getLearners,
  getLearnerById,
  updateLearner,
  deleteLearner,
} from "../controllers/learnerController.js";

const router = express.Router();

// Create a new learner (protected route)
router.post("/", verifyToken, createLearner);

// Get all learners (protected route)
router.get("/", verifyToken, getLearners);

// Get a learner by ID (protected route)
router.get("/:id", verifyToken, getLearnerById);

// Update a learner by ID (protected route)
router.put("/:id", verifyToken, updateLearner);

// Delete a learner by ID (protected route)
router.delete("/:id", verifyToken, deleteLearner);

export default router;
