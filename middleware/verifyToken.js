import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../constant/http.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(UNAUTHORIZED)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(UNAUTHORIZED)
        .json({ success: false, message: "Invalid token." });
    }
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(BAD_REQUEST).json({ success: false, message: "Invalid token." });
  }
};
