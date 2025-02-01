import mongoose from "mongoose";
import { z } from "zod";

// Define the Zod schema
const adminSchemaZod = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contact: z.string().min(1),
  lastLogin: z.date().optional(),
  isVerified: z.boolean().optional(),
  resetPasswordToken: z.string().optional(),
  resetPasswordExpiresAt: z.date().optional(),
  verificationToken: z.string().optional(),
  verificationTokenExpiresAt: z.date().optional(),
});

// Define the Mongoose schema
const adminSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
export const validateAdmin = (admin) => adminSchemaZod.parse(admin);
