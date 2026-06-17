const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const authMiddleware = require("../middlewares/authMiddleware");

// Kiểm tra nếu authMiddleware là object thì lấy thuộc tính của nó, nếu không thì dùng trực tiếp
const middlewareXacThuc =
  typeof authMiddleware === "function"
    ? authMiddleware
    : authMiddleware.authMiddleware || ((req, res, next) => next());

router.post("/", middlewareXacThuc, supplierController.taoNhaCungCapMoi);
router.get("/", middlewareXacThuc, supplierController.layDanhSachNhaCungCap);

module.exports = router;
