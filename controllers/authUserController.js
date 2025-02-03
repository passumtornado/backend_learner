import "dotenv/config";
import { Admin, validateAdmin } from "../models/adminModel.js";
import { User, validateUser } from "../models/userModel.js";
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

// Register a new user
export const userSignup = async (req, res) => {
  try {
    // Validate the request body using Zod
    const validatedData = validateUser(req.body);

    // Check if the email already exists
    const existingLearner = await User.findOne({
      email: validatedData.email,
    });
    if (existingLearner) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const verificationToken = generateVerificationToken();
    // Create a new user
    const newUser = new User({
      ...validatedData,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    // Save the learner to the database
    await newUser.save();
    // jwt
    generateTokenAndSetCookie(res, newUser._id, "Learner");

    // await  sendVerificationEmail(newAdmin.email, verificationToken);
    await sendVerificationEmail(
      newUser.email,
      verificationToken,
      VERIFICATION_EMAIL_TEMPLATE
    );

    res.status(CREATED).json({
      success: true,
      message: "User created successfully",
      user: {
        ...newUser._doc,
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
  //  const { verificationToken } = req.body;
   const user = await User.findOne({
     verificationToken:token,
     verificationTokenExpiresAt: { $gt: Date.now() },
   });

   if (!user) {
     return res
       .status(BAD_REQUEST)
       .json({ success: false, message: "Invalid or expired token" });
   }

   user.isVerified = true;
   user.verificationToken = undefined;
   user.verificationTokenExpiresAt = undefined;

   await user.save();

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

//learner login
export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Invalid credentials" });
    }
    // jwt
    generateTokenAndSetCookie(res, user._id, "Learner");

    user.lastLogin = Date.now();
    await user.save();
    res.status(OK_S).json({
      success: true,
      message: "Login successful",
      user: {
        ...user._doc,
        password: null,
      },
    });
  } catch (error) {
    res.status(BAD_REQUEST).json({ success: false, message: error.message });
    console.log("Error in login ", error);
  }
};

//user logout
export const userLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(OK_S).json({ success: true, message: "Logged out successfully" });
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "User not found" });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();
    // Send reset password email
    await sendPasswordResetEmail(
      user.email,
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

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email, PASSWORD_RESET_SUCCESS_TEMPLATE);

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
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(BAD_REQUEST)
        .json({ success: false, message: "User not found" });
    }

    res.status(OK_S).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(BAD_REQUEST).json({ success: false, message: error.message });
  }
};