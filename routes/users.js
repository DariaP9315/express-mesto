const router = require('express').Router();
const {
  createUser, getUsers, getProfile,
  updateAvatar, updateUser,
} = require('../controllers/users');

router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:userId', getProfile);
router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;
