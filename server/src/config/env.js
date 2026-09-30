const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtAccessSecret:process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret:process.env.JWT_REFRESH_SECRET,
};

export default config;