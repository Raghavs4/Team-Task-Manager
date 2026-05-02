const express = require('express');
const { body } = require('express-validator');
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * Signup validation rules using express-validator.
 *
 * Rules:
 *  - name:     required, min 3 characters
 *  - email:    valid email format
 *  - password: min 6 chars, must include uppercase, lowercase, digit, special char
 */
const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
    .withMessage(
      'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.'
    ),
];

// POST /api/auth/signup
router.post('/signup', signupValidation, validate, signup);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
