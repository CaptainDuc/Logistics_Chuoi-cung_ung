/**
 * Controller xử lý các nghiệp vụ liên quan đến Tồn Kho (Inventory).
 * Bao gồm:
 * - Quét mã QR / SKU để nhập kho hoặc xuất kho.
 * - Tự động gửi email cảnh báo khi sản phẩm sắp hết hàng (qua Nodemailer).
 * - Xuất báo cáo tồn kho ra file Excel (qua thư viện xlsx).
 */
const Product = require("../models/Product");
const InventoryLog = require("../models/InventoryLog");
const XLSX = require("xlsx");
const { sendInventoryAlert } = require("../utils/mailer");


/**
 * POST /api/inventory/scan
 * Xử lý dữ liệu quét mã QR (SKU) từ thiết bị.
 * Thực hiện nhập kho (Import) hoặc xuất kho (Export) cho sản phẩm tương ứng.
 */
const quetMaQR = async (req, res) => {
  try {
    const { sku, type, quantity } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email; // <--- Lấy email động của Admin đang đăng nhập từ token xác thực

    if (!sku || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Các trường "sku", "type" và "quantity" là bắt buộc.',
      });
    }

    if (!["Import", "Export"].includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          'Trường "type" phải là "Import" (nhập kho) hoặc "Export" (xuất kho).',
      });
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Trường "quantity" phải là số nguyên dương lớn hơn 0.',
      });
    }

    const sanPham = await Product.findOne({ sku: sku.trim().toUpperCase() });
    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với mã SKU "${sku}". Vui lòng kiểm tra lại mã vạch.`,
      });
    }

    let soLuongTruoc = sanPham.quantity;
    let soLuongSau = soLuongTruoc;

    if (type === "Import") {
      soLuongSau = soLuongTruoc + quantity;
      sanPham.quantity = soLuongSau;
      await sanPham.save();
    } else if (type === "Export") {
      if (soLuongTruoc < quantity) {
        return res.status(400).json({
          success: false,
          message: `Số lượng xuất (${quantity}) vượt quá số lượng tồn kho hiện tại (${soLuongTruoc}). Không thể xuất kho.`,
        });
      }

      soLuongSau = soLuongTruoc - quantity;
      sanPham.quantity = soLuongSau;
      await sanPham.save();

      if (soLuongSau <= sanPham.minQuantity) {
        const alertType = soLuongSau === 0 ? "OUT_OF_STOCK" : "LOW_STOCK";
        console.log(
          `[Inventory] ⚠️  Sản phẩm "${sanPham.name}" ${
            alertType === "OUT_OF_STOCK" ? "đã hết hàng" : "sắp hết hàng"
          }. Tiến hành gửi email cảnh báo tới Admin ${userEmail}...`,
        );
        // Gửi email động tới Admin đang thao tác
        sendInventoryAlert(userEmail, sanPham, alertType);
      }
    }

    const logGiaoDich = await InventoryLog.create({
      productId: sanPham._id,
      userId: userId,
      type: type,
      quantity: quantity,
    });

    return res.status(200).json({
      success: true,
      message: `Giao dịch ${
        type === "Import" ? "nhập kho" : "xuất kho"
      } thành công.`,
      data: {
        sanPham: {
          _id: sanPham._id,
          name: sanPham.name,
          sku: sanPham.sku,
          soLuongTruoc: soLuongTruoc,
          soLuongThayDoi: type === "Import" ? `+${quantity}` : `-${quantity}`,
          soLuongSau: soLuongSau,
          location: sanPham.location,
        },
        logGiaoDich: {
          _id: logGiaoDich._id,
          type: logGiaoDich.type,
          quantity: logGiaoDich.quantity,
          createdAt: logGiaoDich.createdAt,
        },
        nguoiThucHien: {
          _id: req.user._id,
          username: req.user.username,
          role: req.user.role,
        },
      },
    });
  } catch (err) {
    console.error("[Inventory Controller] Lỗi quetMaQR:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý quét mã QR.",
    });
  }
};

/**
 * GET /api/inventory/logs
 * Lấy lịch sử nhập/xuất kho (InventoryLog).
 */
const layLichSuGiaoDich = async (req, res) => {
  try {
    const { productId, userId, type, limit } = req.query;
    const filter = {};

    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (type && ["Import", "Export"].includes(type)) filter.type = type;

    const soLuongGiớiHan = parseInt(limit) > 0 ? parseInt(limit) : 100;

    const danhSachLog = await InventoryLog.find(filter)
      .populate("productId", "name sku location")
      .populate("userId", "username role")
      .sort({ createdAt: -1 })
      .limit(soLuongGiớiHan);

    return res.status(200).json({
      success: true,
      message: `Lấy lịch sử giao dịch thành công. Tìm thấy ${danhSachLog.length} bản ghi.`,
      data: danhSachLog,
      total: danhSachLog.length,
    });
  } catch (err) {
    console.error("[Inventory Controller] Lỗi layLichSuGiaoDich:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử giao dịch.",
    });
  }
};

/**
 * GET /api/inventory/export-excel
 * Xuất báo cáo tồn kho hiện tại ra file Excel (.xlsx).
 */
const xuatBaoCaoExcel = async (req, res) => {
  try {
    const danhSachSanPham = await Product.find({})
      .populate("supplierId", "name")
      .sort({ createdAt: -1 });

    if (danhSachSanPham.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có dữ liệu sản phẩm để xuất báo cáo.",
      });
    }

    const duLieuExcel = danhSachSanPham.map((sp, index) => {
      let trangThai = "Còn hàng";
      if (sp.quantity <= 0) {
        trangThai = "Hết hàng";
      } else if (sp.quantity < sp.minQuantity) {
        trangThai = "Sắp hết - Cần nhập thêm";
      }

      return {
        STT: index + 1,
        "Mã SKU": sp.sku,
        "Tên sản phẩm": sp.name,
        "Số lượng tồn kho": sp.quantity,
        "Hạn mức cảnh báo": sp.minQuantity,
        "Trạng thái tồn kho": trangThai,
        "Nhà cung cấp": sp.supplierId ? sp.supplierId.name : "Không xác định",
        "Vị trí lưu trữ": sp.location || "",
        "Ngày tạo": sp.createdAt
          ? new Date(sp.createdAt).toLocaleString("vi-VN")
          : "",
        "Ngày cập nhật cuối": sp.updatedAt
          ? new Date(sp.updatedAt).toLocaleString("vi-VN")
          : "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(duLieuExcel);

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 40 },
      { wch: 18 },
      { wch: 18 },
      { wch: 25 },
      { wch: 35 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo tồn kho");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const thoiGian = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const tenFile = `BaoCaoTonKho_${thoiGian}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${tenFile}"`);
    res.setHeader("Content-Length", buffer.length);

    console.log(
      `[Inventory]  Đã xuất báo cáo Excel: "${tenFile}" (${danhSachSanPham.length} sản phẩm)`,
    );

    return res.status(200).send(buffer);
  } catch (err) {
    console.error("[Inventory Controller] Lỗi xuatBaoCaoExcel:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xuất báo cáo Excel.",
    });
  }
};

module.exports = {
  quetMaQR,
  layLichSuGiaoDich,
  xuatBaoCaoExcel,
};
