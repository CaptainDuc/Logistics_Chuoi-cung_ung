const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middlewares/authMiddleware");

const middlewareXacThuc =
  typeof authMiddleware === "function"
    ? authMiddleware
    : authMiddleware.authMiddleware || ((req, res, next) => next());

router.post("/", middlewareXacThuc, customerController.taoKhachHangMoi);
router.get("/", middlewareXacThuc, customerController.layDanhSachKhachHang);

module.exports = router;
