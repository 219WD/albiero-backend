const express = require('express');
const {
  register,
  login,
  getMe
} = require('../controllers/authController');
const {
  validateUserRegistration,
  validateLogin
} = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);

module.exports = router;