import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK_S } from "../constant/http.js";
import { Course, validateCourse } from "../models/courseModel.js";
import { Admin } from "../models/adminModel.js";
import { z } from "zod";
// Create a new course
export const createCourse = async (req, res) => {
  try {
    console.log(req.userId);
    const validatedData = validateCourse(req.body);
     const admin = await Admin.findById(req.userId);
     if (!admin) {
       return res.status(404).json({ message: "Admin not found" });
     }
    const newCourse = new Course({
      ...validatedData,
      adminId: req.userId,
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId);
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }
    const courses = await Course.find({ adminId: req.userId });
    res.status(OK_S).json({
        success:true,
        message: "Courses fetched successfully",
        courses,
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

// Get a course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(NOT_FOUND).json({success:false, message: "Course not found" });
    }
    res
      .status(OK_S)
      .json({ success: true, message: "Courses fetched successfully", course });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

// Update a course by ID
export const updateCourse = async (req, res) => {
  try {
    const validatedData = validateCourse(req.body);
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(NOT_FOUND).json({success:false, message: "Course not found" });
    }
    res
      .status(200)
      .json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(BAD_REQUEST).json({ message: error.errors });
    }
    res.status(INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

// Delete a course by ID
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(NOT_FOUND).json({success:false, message: "Course not found" });
    }
    res.status(OK_S).json({success:true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({success:false, message: "Internal server error" });
  }
};
