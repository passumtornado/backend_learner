import mongoose from "mongoose";
import { z } from "zod";

// Define the Zod schema
const invoiceSchemaZod = z.object({
  learnerID: z.string().min(1).optional(),
  amount: z.number().positive(),
  status: z.enum(["paid", "pending"]),
  // date: z.date(),
  paymentDetails: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

// Define the Mongoose schema
const invoiceSchema = new mongoose.Schema(
  {
    learnerID: {
      type: String,
      required:false
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending"],
      required: true,
    },
  
    paymentDetails: {
      type: String,
      default: "",
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to generate invoice number
invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceNumber = `GN${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
export const validateInvoice = (invoice) => invoiceSchemaZod.parse(invoice);
