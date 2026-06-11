import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.JWT_ACCESS_SECRET.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
}

if (process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cookie: {
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
  },
  isProduction: process.env.NODE_ENV === "production",
};
