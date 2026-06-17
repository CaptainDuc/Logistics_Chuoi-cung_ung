const Supplier = require("../models/Supplier");

// POST /api/suppliers - Thêm nhanh nhà cung cấp mới
const taoNhaCungCapMoi = async (req, res) => {
  try {
    const { name, contactName, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên nhà cung cấp là bắt buộc.",
      });
    }

    // Kiểm tra trùng tên hoặc trùng số điện thoại (nếu cần)
    const nccTonTai = await Supplier.findOne({ name: name.trim() });
    if (nccTonTai) {
      return res.status(409).json({
        success: false,
        message: "Tên nhà cung cấp này đã tồn tại trong hệ thống.",
      });
    }

    const nccMoi = await Supplier.create({
      name: name.trim(),
      contactName: contactName || "",
      email: email || "",
      phone: phone || "",
    });

    return res.status(201).json({
      success: true,
      message: "Thêm nhà cung cấp mới thành công.",
      data: nccMoi,
    });
  } catch (err) {
    console.error("[Supplier Controller] Lỗi taoNhaCungCapMoi:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo nhà cung cấp.",
    });
  }
};

// GET /api/suppliers - Lấy danh sách để đổ vào ô Dropdown chọn ở Front-end
const layDanhSachNhaCungCap = async (req, res) => {
  try {
    const danhSach = await Supplier.find({}).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: danhSach,
    });
  } catch (err) {
    console.error(
      "[Supplier Controller] Lỗi layDanhSachNhaCungCap:",
      err.message,
    );
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách nhà cung cấp.",
    });
  }
};

module.exports = {
  taoNhaCungCapMoi,
  layDanhSachNhaCungCap,
};
