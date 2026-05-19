/**
 * Router định tuyến cho các endpoint liên quan đến Sản Phẩm (Product).
 * Base path: /api/products
 * Tất cả các route đều được bảo vệ bởi middleware protect (yêu cầu đăng nhập).
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Áp dụng middleware protect cho TẤT CẢ route trong router này.
// Tất cả API sản phẩm yêu cầu người dùng đã đăng nhập.
router.use(protect);

/**
 * GET /api/products
 * Lấy toàn bộ danh sách sản phẩm.
 *  Query params: ?search= (tìm theo tên), ?supplierId= (lọc theo nhà cung cấp).
 */
router.get('/', productController.layTatCaSanPham);

/**
 * GET /api/products/:id
 * Lấy chi tiết một sản phẩm theo ID.
 */
router.get('/:id', productController.layChiTietSanPham);

/**
 * POST /api/products
 * Thêm mới một sản phẩm.
 * Body: { name, sku, quantity?, minQuantity?, supplierId?, location? }
 */
router.post('/', productController.taoSanPhamMoi);

/**
 * PUT /api/products/:id
 * Cập nhật thông tin sản phẩm theo ID.
 * Body: { name?, sku?, quantity?, minQuantity?, supplierId?, location? }
 */
router.put('/:id', productController.capNhatSanPham);

/**
 * DELETE /api/products/:id
 *  Xóa một sản phẩm theo ID.
 * Chỉ tài khoản có role 'Admin' mới được phép thực hiện.
 */
router.delete('/:id', authorize('Admin'), productController.xoaSanPham);

module.exports = router;
