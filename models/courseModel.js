import mongoose from "mongoose";
import { z } from "zod";

// Define the Zod schema
const courseSchemaZod = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  instructor: z.string().min(1),
  duration: z.string().min(1),
  stacks: z.array(z.string().min(1)),
  image: z.string().url(),
  descriptions: z.string().min(1),
//   adminId: z.string().min(1),
});

// Define the Mongoose schema
const courseSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    stacks: {
      type: [String],
      required: true,
    },
    image: {
      type: String,
      //   required: true,
    },
    descriptions: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
export const validateCourse = (course) => courseSchemaZod.parse(course);
