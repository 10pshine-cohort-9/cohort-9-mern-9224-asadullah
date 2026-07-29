const express = require('express');

const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router();

const { registerUser, loginUser,getCurrentUser } = require('../controllers/auth.controller');

router.post('/register', registerUser);

router.post('/login', loginUser)

router.get('/me', authMiddleware, getCurrentUser)



module.exports = router;