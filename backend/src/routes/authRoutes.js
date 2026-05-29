/**
 * Router định tuyến cho các endpoint xác thực.
 * Base path: /api/auth
 */
<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
=======
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
>>>>>>> main

/**
 * POST /api/auth/login
 * Nhận username và password, trả về AccessToken & RefreshToken.
 */
<<<<<<< HEAD
router.post('/login', authController.login);
=======
router.post("/login", authController.login);
>>>>>>> main

/**
 * POST /api/auth/refresh-token
 * Nhận RefreshToken, trả về AccessToken mới.
 * Không yêu cầu xác thực (client gửi refreshToken trong body).
 */
<<<<<<< HEAD
router.post('/refresh-token', authController.refreshToken);
=======
router.post("/refresh-token", authController.refreshToken);
>>>>>>> main

/**
 * POST /api/auth/logout
 * Xóa RefreshToken trong DB, vô hiệu hóa phiên làm việc.
 * Nên gửi kèm AccessToken trong Header Authorization để xác định user.
 */
<<<<<<< HEAD
router.post('/logout', protect, authController.logout);
=======
router.post("/logout", protect, authController.logout);
>>>>>>> main

module.exports = router;
