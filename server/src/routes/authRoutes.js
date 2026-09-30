import express from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

import  validateRegistration  from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateRegistration, register);

router.post("/login", login);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;