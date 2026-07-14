import rateLimit from "express-rate-limit";

//Login - Register - Google - 10/15'
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many auth attempts. Please try again later.",
  },
});

// AI summarize — 5 lần / 1 phút 
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please try again in a minute.",
  },
});