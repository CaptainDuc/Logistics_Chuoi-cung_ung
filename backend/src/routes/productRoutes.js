/**
 * Router định tuyến cho các endpoint liên quan đến Sản Phẩm (Product).
 * Base path: /api/products
 * Tất cả các route đều được bảo vệ bởi middleware protect (yêu cầu đăng nhập).
 *
 * @swagger
 * tags:
 *   name: Products
 *   description: CRUD Sản phẩm trong kho hàng
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm (có phân trang)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số item/trang (tối đa 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sản phẩm
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *         description: Lọc theo nhà cung cấp
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, sku, quantity, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm kèm thông tin phân trang
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
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/', productController.layTatCaSanPham);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy chi tiết một sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get('/:id', productController.layChiTietSanPham);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Thêm sản phẩm mới
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Máy tính xách tay Dell XPS 13"
 *               sku:
 *                 type: string
 *                 example: "LAP-DELL-XPS13-001"
 *               quantity:
 *                 type: integer
 *                 default: 0
 *               minQuantity:
 *                 type: integer
 *                 default: 10
 *               supplierId:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 *       409:
 *         description: Mã SKU đã tồn tại
 */
router.post('/', productController.taoSanPhamMoi);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Products]
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
 *               name: { type: string }
 *               sku: { type: string }
 *               quantity: { type: integer }
 *               minQuantity: { type: integer }
 *               supplierId: { type: string }
 *               location: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.put('/:id', productController.capNhatSanPham);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *         description: Chỉ Admin mới được xóa
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.delete('/:id', authorize('Admin'), productController.xoaSanPham);

module.exports = router;
