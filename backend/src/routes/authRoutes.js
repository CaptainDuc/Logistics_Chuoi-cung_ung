/**
 * Router định tuyến cho các endpoint xác thực.
 * Base path: /api/auth
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * POST /api/auth/login
 * Nhận username và password, trả về AccessToken & RefreshToken.
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/refresh-token
 * Nhận RefreshToken, trả về AccessToken mới.
 * Không yêu cầu xác thực (client gửi refreshToken trong body).
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * POST /api/auth/logout
 * Xóa RefreshToken trong DB, vô hiệu hóa phiên làm việc.
 * Nên gửi kèm AccessToken trong Header Authorization để xác định user.
 */
router.post('/logout', protect, authController.logout);

module.exports = router;
