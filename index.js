import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constant/env.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import learnerRoutes from "./routes/learnerRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import authUserRoutes from './routes/authUserRoutes.js'

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://tmp-se-project.azurewebsites.net",
];

app.use(
  cors({
    origin: allowedOrigins, // Allow specific origins
    credentials: true, // Allow cookies if needed
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
  })
);

app.use(cookieParser());
app.use("/api/admin/auth", authRoutes);
app.use("/api/user/auth", authUserRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/learners", learnerRoutes);
app.use("/api/revenues", revenueRoutes);
app.use("/api/invoices", invoiceRoutes);
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} on ${NODE_ENV} environment`);
  await connectDB();
});

