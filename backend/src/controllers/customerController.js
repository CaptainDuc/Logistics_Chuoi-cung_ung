const Customer = require("../models/Customer");

// POST /api/customers - Thêm nhanh một khách hàng / đại lý mới
const taoKhachHangMoi = async (req, res) => {
  try {
    const { name, contactName, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên đại lý / khách hàng là bắt buộc.",
      });
    }

    // Kiểm tra xem tên đại lý này đã được tạo trước đó chưa
    const khachHangTonTai = await Customer.findOne({ name: name.trim() });
    if (khachHangTonTai) {
      return res.status(409).json({
        success: false,
        message: "Tên đại lý / khách hàng này đã tồn tại trên hệ thống.",
      });
    }

    const khachHangMoi = await Customer.create({
      name: name.trim(),
      contactName: contactName || "",
      phone: phone || "",
      address: address || "",
    });

    return res.status(201).json({
      success: true,
      message: "Thêm đại lý / khách hàng mới thành công.",
      data: khachHangMoi,
    });
  } catch (err) {
    console.error("[Customer Controller] Lỗi taoKhachHangMoi:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo thông tin khách hàng.",
    });
  }
};

// GET /api/customers - Lấy toàn bộ danh sách khách hàng để chọn ở Form Xuất Kho
const layDanhSachKhachHang = async (req, res) => {
  try {
    const danhSach = await Customer.find({}).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: danhSach,
    });
  } catch (err) {
    console.error(
      "[Customer Controller] Lỗi layDanhSachKhachHang:",
      err.message,
    );
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách khách hàng.",
    });
  }
};

module.exports = {
  taoKhachHangMoi,
  layDanhSachKhachHang,
};
