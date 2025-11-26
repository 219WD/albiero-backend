const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUsers
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Solo administradores
router.get('/', authorize('admin'), getUsers);

module.exports = router;