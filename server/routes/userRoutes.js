const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// All user routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);
router.patch('/:id/role', updateUserRole);

module.exports = router;

