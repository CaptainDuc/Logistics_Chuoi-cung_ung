/**
 * Middleware bảo mật JWT cho các route cần xác thực.
 * - protect : Xác thực Access Token từ Header Authorization (Bearer Token).
 *             Giải mã token bằng JWT_SECRET, đính kèm thông tin user vào req.user.
 * - authorize(...roles): Kiểm tra role của req.user có nằm trong danh sách được phép hay không.
 */
<<<<<<< HEAD
const jwt = require('jsonwebtoken');
const User = require('../models/User');
=======
const jwt = require("jsonwebtoken");
const User = require("../models/User");
>>>>>>> main

/**
 * Kiểm tra và giải mã Access Token.
 * Gắn thông tin người dùng vào req.user nếu token hợp lệ.
 * Trả về 401 nếu không có token, token hết hạn hoặc không hợp lệ.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

<<<<<<< HEAD
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy Access Token. Vui lòng đăng nhập.',
      });
    }

    const token = authHeader.split(' ')[1];
=======
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy Access Token. Vui lòng đăng nhập.",
      });
    }

    const token = authHeader.split(" ")[1];
>>>>>>> main

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
<<<<<<< HEAD
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access Token đã hết hạn. Vui lòng làm mới token.',
=======
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access Token đã hết hạn. Vui lòng làm mới token.",
>>>>>>> main
        });
      }
      return res.status(401).json({
        success: false,
<<<<<<< HEAD
        message: 'Access Token không hợp lệ.',
      });
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại.',
=======
        message: "Access Token không hợp lệ.",
      });
    }

    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại.",
>>>>>>> main
      });
    }

    req.user = user;
    next();
<<<<<<< HEAD

  } catch (err) {
    console.error('[Auth Middleware] Lỗi protect:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực token.',
=======
  } catch (err) {
    console.error("[Auth Middleware] Lỗi protect:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực token.",
>>>>>>> main
    });
  }
};

/**
 * Kiểm tra quyền truy cập dựa trên role.
 * Chỉ cho phép các role nằm trong danh sách tham số được truyền vào.
 * Trả về 403 nếu role không khớp.
 *
 * @param  {...string} roles - Danh sách các role được phép (VD: 'Admin', 'User')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
<<<<<<< HEAD
        message: 'Chưa xác thực người dùng.',
=======
        message: "Chưa xác thực người dùng.",
>>>>>>> main
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản "${req.user.role}" không có quyền truy cập tài nguyên này.`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
