/**
 * Router định tuyến cho các endpoint liên quan đến Tồn Kho (Inventory).
 * Base path: /api/inventory
 */
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Áp dụng middleware protect cho TẤT CẢ route trong router này.
router.use(protect);

/**
 * POST /api/inventory/scan
 * Xử lý quét mã QR / SKU để nhập kho hoặc xuất kho.
 * Body: { sku: string, type: 'Import'|'Export', quantity: number }
 */
router.post("/scan", inventoryController.quetMaQR);

/**
 * GET /api/inventory/logs
 * Lấy lịch sử nhập/xuất kho (InventoryLog).
 * Query params:
 *   - ?productId= : lọc theo sản phẩm
 *   - ?userId=    : lọc theo người thực hiện
 *   - ?type=      : lọc theo loại giao dịch (Import/Export)
 *   - ?limit=     : giới hạn số bản ghi trả về (mặc định 100)
 */
router.get("/logs", inventoryController.layLichSuGiaoDich);

/**
 * GET /api/inventory/export-excel
 * Xuất báo cáo tồn kho ra file Excel (.xlsx).
 * Chỉ tài khoản có role 'Admin' mới được phép thực hiện.
 */
router.get(
  "/export-excel",
  authorize("Admin"),
  inventoryController.xuatBaoCaoExcel
);

module.exports = router;
