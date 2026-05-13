import rateLimit from "express-rate-limit";

const GLOBAL_MAX = process.env.GLOBAL_RATE_MAX ? parseInt(process.env.GLOBAL_RATE_MAX, 10) : (process.env.NODE_ENV === 'test' ? 0 : 300);
const AUTH_MAX = process.env.RATE_LIMIT_AUTH_MAX ? parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) : (process.env.NODE_ENV === 'test' ? 1000 : 5);

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: GLOBAL_MAX,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: AUTH_MAX,
    message: {
        success: false,
        message: "Too many login attempts",
    },
});