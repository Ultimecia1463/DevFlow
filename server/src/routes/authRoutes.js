import express from "express";
import authController from "../controllers/authController.js";
import validateRegistration from "../validators/authValidator.js";

const router = express.Router();

router.post(
  "/register",
  validateRegistration,
  authController.register
);

export default router;  