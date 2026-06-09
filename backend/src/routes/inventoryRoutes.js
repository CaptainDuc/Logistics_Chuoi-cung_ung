/**
 * Router định tuyến cho các endpoint liên quan đến Tồn Kho (Inventory).
 * Base path: /api/inventory
 *
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Nhập kho, xuất kho, lịch sử giao dịch & báo cáo
 */
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.use(protect);

/**
 * @swagger
 * /api/inventory/scan:
 *   post:
 *     summary: Quét mã SKU để nhập kho hoặc xuất kho
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - type
 *               - quantity
 *             properties:
 *               sku:
 *                 type: string
 *                 description: Mã SKU sản phẩm
 *                 example: "LAP-DELL-XPS13-001"
 *               type:
 *                 type: string
 *                 enum: [Import, Export]
 *                 description: "Import = nhập kho, Export = xuất kho"
 *                 example: "Import"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Số lượng nhập/xuất
 *                 example: 10
 *     responses:
 *       200:
 *         description: Giao dịch thành công
 *       400:
 *         description: Số lượng xuất vượt quá tồn kho hoặc dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy sản phẩm với SKU này
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/scan", inventoryController.quetMaQR);

/**
 * @swagger
 * /api/inventory/logs:
 *   get:
 *     summary: Lấy lịch sử nhập/xuất kho
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Lọc theo sản phẩm
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Lọc theo người thực hiện
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Import, Export]
 *         description: Lọc theo loại giao dịch
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Giới hạn số bản ghi
 *     responses:
 *       200:
 *         description: Danh sách lịch sử giao dịch
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/logs", inventoryController.layLichSuGiaoDich);

/**
 * @swagger
 * /api/inventory/export-excel:
 *   get:
 *     summary: Xuất báo cáo tồn kho ra file Excel (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File Excel (.xlsx) chứa báo cáo tồn kho
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Chỉ Admin mới được xuất báo cáo
 *       404:
 *         description: Không có dữ liệu để xuất
 */
router.get(
  "/export-excel",
  authorize("Admin"),
  inventoryController.xuatBaoCaoExcel
);

module.exports = router;
