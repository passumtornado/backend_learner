import mongoose from "mongoose";
import { z } from "zod";

// Define the Zod schema
const userSchemaZod = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  lastLogin: z.date().optional(),
  isVerified: z.boolean().optional(),
  resetPasswordToken: z.string().optional(),
  resetPasswordExpiresAt: z.date().optional(),
  verificationToken: z.string().optional(),
  verificationTokenExpiresAt: z.date().optional(),
});

// Define the Mongoose schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
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

export const User = mongoose.model("Users", userSchema);
export const validateUser = (user) => userSchemaZod.parse(user);
