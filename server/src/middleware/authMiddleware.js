import { verifyAccessToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader)

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.slice(7).trim();

    const decoded = verifyAccessToken(token);
    console.log("TOKEN:", token);
    console.log("DECODED:", decoded);
    console.log("USER ID:", decoded.sub);

    req.userId = decoded.sub;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export default authMiddleware;