const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/', protect, controller.getUsers); // guests and admins can GET aggregated data
router.put('/:id', protect, adminOnly, controller.updateUser);
router.delete('/:id', protect, adminOnly, controller.deleteUser);

module.exports = router;
