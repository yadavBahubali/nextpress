const express = require('express');
const authController = require('./auth.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { loginLimiter, registerLimiter } = require('../../middleware/rateLimiter');
const { validateBody } = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = express.Router();

router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
// User directory (emails/roles) - restricted to Admin/Super Admin, not just
// any authenticated account.
router.get('/users', protect, authorize(1, 2), authController.getUsers);

module.exports = router;
