const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Tất cả các route bên dưới đều bắt buộc phải đăng nhập
router.use(protect);

// Endpoint lấy danh sách sản phẩm sắp hết hàng (Phải đặt TRÊN route '/:id')
router.get("/low-stock", productController.laySanPhamSapHetHang);

// Các endpoint CRUD cơ bản của sản phẩm
router.get("/", productController.layTatCaSanPham);
router.get("/:id", productController.layChiTietSanPham);
router.post("/", productController.taoSanPhamMoi);
router.put("/:id", productController.capNhatSanPham);

// Chỉ tài khoản có quyền 'Admin' mới được xóa sản phẩm
router.delete("/:id", authorize("Admin"), productController.xoaSanPham);

module.exports = router;
