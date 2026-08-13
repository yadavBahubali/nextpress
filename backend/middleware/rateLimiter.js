const rateLimit = require('express-rate-limit');

/**
 * Rate limiters for endpoints that are either unauthenticated or security
 * sensitive, to blunt brute-force login attempts and spam/DoS against public
 * forms. Limits are per-IP.
 */

// Login: tight limit, since this is the primary brute-force target.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

// Registration: prevents automated mass account creation.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many accounts created from this address. Please try again later.' },
});

// Public form submissions / job applications: generous enough for real
// visitors, tight enough to blunt spam bots.
const publicSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

module.exports = { loginLimiter, registerLimiter, publicSubmissionLimiter };
