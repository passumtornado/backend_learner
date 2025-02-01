import "dotenv/config";
import { Admin, validateAdmin } from "../models/adminModel.js";
import { User, validateUser } from "../models/userModel.js";
import { Learner } from "../models/learnerModel.js";
import bcrypt from "bcrypt";
import { OK, z } from "zod";
import crypto from "crypto";
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK_S,
} from "../constant/http.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendWelcomeEmail,
} from "../sendgrid/sendgridConfig.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "../sendgrid/emailTemplates.js";

// ========== admin  controllers ===========

export const adminSignup = async (req, res) => {
  try {
    // Validate the request body using Zod
    const validatedData = validateAdmin(req.body);

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email: validatedData.email });
    if (existingAdmin) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Generate a 6-digit verification code
    const verificationToken = generateVerificationToken();
    // Create a new admin
    const newAdmin = new Admin({
      ...validatedData,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Save the admin to the database
    await newAdmin.save();

    // jwt
    generateTokenAndSetCookie(res, newAdmin._id, "Admin");

    // Send verification email
    // await  sendVerificationEmail(newAdmin.email, verificationToken);
    await sendVerificationEmail(
      newAdmin.email,
      verificationToken,
      VERIFICATION_EMAIL_TEMPLATE
    );

    res.status(CREATED).json({
      success: true,
      message: "Admin created successfully",
      Admin: {
        ...newAdmin._doc,
        password: null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: error.errors });
    }
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
    console.log(error);
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    const admin = await Admin.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!admin) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Invalid or expired token" });
    }
    admin.isVerified = true;
    admin.verificationToken = undefined;
    admin.verificationTokenExpiresAt = undefined;
    await admin.save();

    await sendWelcomeEmail(
      admin.email,
      admin.first_name,
      WELCOME_EMAIL_TEMPLATE
    );

    res.status(CREATED).json({
      success: true,
      message: "Email verified successfully",
      Admin: {
        ...admin._doc,
        password: null,
      },
    });
  } catch (error) {
    console.log("Email verification error", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Invalid credentials" });
    }
    // jwt
    generateTokenAndSetCookie(res, admin._id, "Admin");

    admin.lastLogin = Date.now();
    await admin.save();
    res.status(OK_S).json({
      success: true,
      message: "Login successful",
      Admin: {
        ...admin._doc,
        password: null,
      },
    });
  } catch (error) {
    res.status(BAD_REQUEST).json({ success: false, message: error.message });
    console.log("Error in login ", error);
  }
};

export const adminLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(OK_S).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "admin not found" });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpiresAt = resetTokenExpiresAt;
    await admin.save();
    // Send reset password email
    await sendPasswordResetEmail(
      admin.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
      PASSWORD_RESET_REQUEST_TEMPLATE
    );
    res
      .status(OK_S)
      .json({ success: true, message: "Reset password email sent" });
  } catch (error) {
    res.status(BAD_REQUEST).json({ success: false, message: error.message });
    console.log("Error in forgot password ", error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!admin) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcrypt.hash(password, 10);

    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpiresAt = undefined;
    await admin.save();

    await sendResetSuccessEmail(admin.email, PASSWORD_RESET_SUCCESS_TEMPLATE);

    res
      .status(OK_S)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(BAD_REQUEST).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    console.log("req.userId:", req.userId); // Debugging log
    const admin = await Admin.findById(req.userId).select("-password");
    if (!admin) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Admin not found" });
    }

    res.status(OK_S).json({ success: true, admin });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// Update admin details
export const updateAdmin = async (req, res) => {
  try {
    const validatedData = validateAdmin(req.body);
    const adminId = req.user.id;

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, validatedData, {
      new: true,
    });
    if (!updatedAdmin) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Admin not found" });
    }

    res
      .status(OK)
      .json({
        success: true,
        message: "Admin updated successfully",
        admin: updatedAdmin,
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: error.errors });
    }
    console.error("Error in updateAdmin:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};


