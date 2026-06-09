/**
 * Controller xử lý các thao tác quản lý Tài Khoản Người Dùng (User).
 * Chỉ Admin mới có quyền truy cập các endpoint trong file này.
 */
const bcrypt = require("bcryptjs");
const User = require("../models/User");

/* =========================================================
 * GET /api/users
 * Lấy danh sách tất cả tài khoản (Admin only).
 * ========================================================= */
const layTatCaTaiKhoan = async (req, res) => {
  try {
    const { search, role, isActive } = req.query;
    const filter = {};

    if (search) {
      filter.username = { $regex: search, $options: "i" };
    }
    if (role && ["Admin", "User"].includes(role)) {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const danhSach = await User.find(filter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: `Lấy danh sách tài khoản thành công. Tìm thấy ${danhSach.length} tài khoản.`,
      data: danhSach,
      total: danhSach.length,
    });
  } catch (err) {
    console.error("[User Controller] Lỗi layTatCaTaiKhoan:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách tài khoản.",
    });
  }
};

/* =========================================================
 * GET /api/users/:id
 * Lấy chi tiết một tài khoản theo ID (Admin only).
 * ========================================================= */
const layChiTietTaiKhoan = async (req, res) => {
  try {
    const { id } = req.params;

    const taiKhoan = await User.findById(id).select("-password -refreshToken");
    if (!taiKhoan) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tài khoản với ID: ${id}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết tài khoản thành công.",
      data: taiKhoan,
    });
  } catch (err) {
    console.error("[User Controller] Lỗi layChiTietTaiKhoan:", err.message);
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `ID tài khoản không hợp lệ: ${req.params.id}.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết tài khoản.",
    });
  }
};

/* =========================================================
 * POST /api/users
 * Tạo tài khoản mới (Admin only).
 * Body: { username, password, role }
 * ========================================================= */
const taoTaiKhoanMoi = async (req, res) => {
  try {
    const { username, password, role, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username và password là bắt buộc.",
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập phải có ít nhất 3 ký tự.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    if (role && !["Admin", "User"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò (role) phải là "Admin" hoặc "User".',
      });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Tên đăng nhập đã tồn tại trong hệ thống.",
      });
    }

    const matKhauHash = await bcrypt.hash(password, 10);
    const taiKhoanMoi = await User.create({
      username: username.trim(),
      password: matKhauHash,
      email: email ? email.toLowerCase().trim() : null,
      role: role || "User",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo tài khoản mới thành công.",
      data: {
        _id: taiKhoanMoi._id,
        username: taiKhoanMoi.username,
        role: taiKhoanMoi.role,
        isActive: taiKhoanMoi.isActive,
        createdAt: taiKhoanMoi.createdAt,
      },
    });
  } catch (err) {
    console.error("[User Controller] Lỗi taoTaiKhoanMoi:", err.message);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Tên đăng nhập đã tồn tại trong hệ thống.",
      });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join("; "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo tài khoản mới.",
    });
  }
};

/* =========================================================
 * PUT /api/users/:id
 * Cập nhật tài khoản (Admin only).
 * Cho phép: đổi password, đổi role, khóa/mở tài khoản.
 * ========================================================= */
const capNhatTaiKhoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, role, isActive } = req.body;

    const taiKhoan = await User.findById(id);
    if (!taiKhoan) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tài khoản với ID: ${id}.`,
      });
    }

    // Không cho phép tự khóa chính mình
    if (req.user && req.user._id.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không thể tự thay đổi trạng thái tài khoản của chính mình.",
      });
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
        });
      }
      taiKhoan.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
      if (!["Admin", "User"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Vai trò (role) phải là "Admin" hoặc "User".',
        });
      }
      taiKhoan.role = role;
    }

    if (isActive !== undefined) {
      taiKhoan.isActive = Boolean(isActive);
    }

    await taiKhoan.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật tài khoản thành công.",
      data: {
        _id: taiKhoan._id,
        username: taiKhoan.username,
        role: taiKhoan.role,
        isActive: taiKhoan.isActive,
        updatedAt: taiKhoan.updatedAt,
      },
    });
  } catch (err) {
    console.error("[User Controller] Lỗi capNhatTaiKhoan:", err.message);
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `ID tài khoản không hợp lệ: ${req.params.id}.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật tài khoản.",
    });
  }
};

/* =========================================================
 * DELETE /api/users/:id
 * Xóa tài khoản (Admin only).
 * Không cho phép xóa chính mình.
 * ========================================================= */
const xoaTaiKhoan = async (req, res) => {
  try {
    const { id } = req.params;

    // Không cho phép tự xóa chính mình
    if (req.user && req.user._id.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không thể xóa tài khoản của chính mình.",
      });
    }

    const taiKhoanDaXoa = await User.findByIdAndDelete(id);

    if (!taiKhoanDaXoa) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tài khoản với ID: ${id}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa tài khoản thành công.",
      data: {
        _id: taiKhoanDaXoa._id,
        username: taiKhoanDaXoa.username,
        role: taiKhoanDaXoa.role,
      },
    });
  } catch (err) {
    console.error("[User Controller] Lỗi xoaTaiKhoan:", err.message);
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `ID tài khoản không hợp lệ: ${req.params.id}.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa tài khoản.",
    });
  }
};

module.exports = {
  layTatCaTaiKhoan,
  layChiTietTaiKhoan,
  taoTaiKhoanMoi,
  capNhatTaiKhoan,
  xoaTaiKhoan,
};
