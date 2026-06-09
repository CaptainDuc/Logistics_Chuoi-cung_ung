/**
 * Router định tuyến cho các endpoint quản lý Tài Khoản Người Dùng.
 * Base path: /api/users
 * Tất cả endpoint đều yêu cầu đăng nhập và chỉ Admin được phép truy cập.
 *
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý tài khoản người dùng (Admin)
 */
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.use(protect);
router.use(authorize("Admin"));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả tài khoản
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo username
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Admin, User]
 *         description: Lọc theo vai trò
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *     responses:
 *       200:
 *         description: Danh sách tài khoản
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       403:
 *         description: Chỉ Admin mới được truy cập
 */
router.get("/", userController.layTatCaTaiKhoan);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy chi tiết một tài khoản
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết tài khoản
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.get("/:id", userController.layChiTietTaiKhoan);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tạo tài khoản mới
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newhire"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [Admin, User]
 *                 default: User
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *       409:
 *         description: Username đã tồn tại
 */
router.post("/", userController.taoTaiKhoanMoi);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật tài khoản (đổi mật khẩu, vai trò, khóa/mở)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [Admin, User]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không thể tự thay đổi tài khoản của chính mình
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.put("/:id", userController.capNhatTaiKhoan);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa tài khoản (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không thể xóa tài khoản của chính mình
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.delete("/:id", userController.xoaTaiKhoan);

module.exports = router;
