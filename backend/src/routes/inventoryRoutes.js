/**
 * Router cho các endpoint liên quan đến Inventory.
 * Base path: /api/inventory
 */
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

/**
 * POST /api/inventory/scan
 * Thực hiện nhập/xuất kho theo mã SKU, type và quantity.
 */
router.post('/scan', inventoryController.quetMaQR);

/**
 * GET /api/inventory/logs
 * Lấy lịch sử giao dịch nhập/xuất kho.
 */
router.get('/logs', inventoryController.layLichSuGiaoDich);

/**
 * GET /api/inventory/export-excel
 * Xuất báo cáo tồn kho ra file Excel. Chỉ Admin được phép.
 */
router.get('/export-excel', authorize('Admin'), inventoryController.xuatBaoCaoExcel);

module.exports = router;
