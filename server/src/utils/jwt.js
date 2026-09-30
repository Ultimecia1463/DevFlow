import jwt from "jsonwebtoken";
import config from "../config/env.js";

export const createAccessToken = (userId) => {
  const payload = {
    sub: userId.toString(),
    type: "access",
  };

  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: "10m",
  });
};

export const createRefreshToken = (userId, jti) => {
  const payload = {
    sub: userId.toString(),
    jti,
    type: "refresh",
  };

  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: "30d",
  });
};

export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, config.jwtAccessSecret);

  if (decoded.type !== "access") {
    throw new Error("Invalid access token");
  }

  return decoded;
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, config.jwtRefreshSecret);

  if (decoded.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return decoded;
};