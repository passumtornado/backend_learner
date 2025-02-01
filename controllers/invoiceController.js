import { Invoice, validateInvoice } from "../models/invoiceModel.js";
import { z } from "zod";

// Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    const validatedData = validateInvoice(req.body);
     const count = await Invoice.countDocuments();
    let invoiceNumber = `GN${String(count + 1).padStart(3, "0")}`;
    const newInvoice = new Invoice({
      ...validatedData,
      invoiceNumber
    });
    await newInvoice.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Invoice created successfully",
        invoice: newInvoice,
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get an invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const validatedData = validateInvoice(req.body);
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!updatedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Invoice updated successfully",
        invoice: updatedInvoice,
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete an invoice by ID
export const deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
