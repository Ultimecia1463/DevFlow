import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const jti = crypto.randomUUID();

  const refreshExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId: user._id,
    jti,
    expiresAt: refreshExpiresAt,
  });

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id, jti);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    },
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    jti: decoded.jti,
  });

  if (!storedToken) {
    const error = new Error("Refresh session not found");
    error.statusCode = 401;
    throw error;
  }

  if (storedToken.revokedAt) {
    const error = new Error("Refresh token revoked");
    error.statusCode = 401;
    throw error;
  }

  if (storedToken.expiresAt <= new Date()) {
    const error = new Error("Refresh token expired");
    error.statusCode = 401;
    throw error;
  }

  if (storedToken.userId.toString() !== decoded.sub) {
    const error = new Error("Invalid refresh session");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = createAccessToken(decoded.sub);

  return accessToken;
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    await RefreshToken.findOneAndUpdate(
      { jti: decoded.jti },
      {
        revokedAt: new Date(),
      }
    );
  } catch {
    console.log("err")
  }
};