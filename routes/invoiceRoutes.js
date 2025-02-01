import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";

const router = express.Router();

// Create a new invoice (protected route)
router.post("/", verifyToken, createInvoice);

// Get all invoices (protected route)
router.get("/", verifyToken, getInvoices);

// Get an invoice by ID (protected route)
router.get("/:id", verifyToken, getInvoiceById);

// Update an invoice by ID (protected route)
router.put("/:id", verifyToken, updateInvoice);

// Delete an invoice by ID (protected route)
router.delete("/:id", verifyToken, deleteInvoice);

export default router;
