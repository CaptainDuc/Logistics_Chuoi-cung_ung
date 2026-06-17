const Product = require("../models/Product");
const InventoryLog = require("../models/InventoryLog");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const { sendInventoryAlert } = require("../utils/mailer");

const taoTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const guiEmailCanhBao = async (sanPham, emailNguoiNhan) => {
  try {
    const transporter = taoTransporter();
    const emailDich = emailNguoiNhan || process.env.ADMIN_EMAIL;

    const mailOptions = {
      from: `"Hệ thống Quản lý Kho" <${process.env.EMAIL_USER}>`,
      to: emailDich,
      subject: `⚠️ CẢNH BÁO: Sản phẩm "${sanPham.name}" sắp hết hàng!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h2 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-top: 0;">⚠️ Cảnh Báo Sắp Hết Hàng</h2>
          <p>Hệ thống quản lý kho vừa ghi nhận một sản phẩm có số lượng tồn kho thấp hơn mức cảnh báo sau phiên xuất kho của bạn.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 35%;">Tên sản phẩm</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sanPham.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Mã SKU</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sanPham.sku}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Số lượng hiện tại</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c; font-weight: bold;">${sanPham.quantity}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Hạn mức cảnh báo</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sanPham.minQuantity}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Vị trí lưu trữ</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sanPham.location || "Chưa có thông tin"}</td>
            </tr>
          </table>
          <p>Vui lòng kiểm tra kế hoạch và tiến hành nhập thêm hàng hóa để tránh tình trạng đứt gãy chuỗi cung ứng.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">Email được gửi tự động từ Hệ thống Quản lý Kho PTIT. Vui lòng không trả lời email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi email cảnh báo tới địa chỉ: ${emailDich}`);
  } catch (err) {
    console.error(
      `[Email] Gửi email cảnh báo thất bại cho sản phẩm "${sanPham.name}":`,
      err.message,
    );
  }
};

/**
 * POST /api/inventory/scan
 * Xử lý quét QR / lập phiếu nhập xuất với cơ chế ACID Transaction và Atomic Update
 */
const quetMaQR = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Nhận thêm customerName (nhập liệu tự do) và customerId (chọn từ danh sách Khách hàng) từ body gửi lên
    const { sku, type, quantity, customerName, customerId } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    if (!sku || !type || quantity === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Các trường "sku", "type" và "quantity" là bắt buộc.',
      });
    }

    if (!["Import", "Export"].includes(type)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Trường "type" phải là "Import" hoặc "Export".',
      });
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Trường "quantity" phải là số nguyên dương lớn hơn 0.',
      });
    }

    const dinhDangSku = sku.trim().toUpperCase();

    // Bước 1: Kiểm tra xem sản phẩm có tồn tại hay không
    const sanPhamGoc = await Product.findOne({ sku: dinhDangSku }).session(
      session,
    );
    if (!sanPhamGoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với mã SKU "${sku}".`,
      });
    }

    const soLuongTruoc = sanPhamGoc.quantity;
    let dieuKienUpdate = { sku: dinhDangSku };
    let giaTriThayDoi = type === "Import" ? quantity : -quantity;

    // Nếu xuất kho, bắt buộc hàng tồn kho hiện tại phải đủ lớn hơn số lượng xuất (Atomic Check)
    if (type === "Export") {
      dieuKienUpdate.quantity = { $gte: quantity };
    }

    // Bước 2: Cập nhật trực tiếp số lượng tồn kho dưới DB chống Race Condition
    const sanPhamCapNhat = await Product.findOneAndUpdate(
      dieuKienUpdate,
      { $inc: { quantity: giaTriThayDoi } },
      { new: true, session: session },
    ).populate("supplierId", "name");

    if (!sanPhamCapNhat) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Số lượng xuất (${quantity}) vượt quá số lượng tồn thực tế trong kho (${soLuongTruoc}). Giao dịch thất bại.`,
      });
    }

    // Bước 3: Ghi nhận lịch sử giao dịch tương ứng (Ghi cả ID đối tác và Tên text tự do nếu có)
    const logGiaoDich = await InventoryLog.create(
      [
        {
          productId: sanPhamCapNhat._id,
          userId: userId,
          type: type,
          quantity: quantity,
          customerName: customerName || "",
          customerId: customerId || null, // Lưu ID khách hàng phục vụ thống kê nâng cao
        },
      ],
      { session: session },
    );

    await session.commitTransaction();
    session.endSession();

    // Kích hoạt email cảnh báo không đồng bộ bên ngoài Transaction để tối ưu thời gian phản hồi API
    if (
      type === "Export" &&
      sanPhamCapNhat.quantity <= sanPhamCapNhat.minQuantity
    ) {
      guiEmailCanhBao(sanPhamCapNhat, userEmail);
    }
    return res.status(200).json({
      success: true,
      message: `Giao dịch ${type === "Import" ? "nhập kho" : "xuất kho"} thành công.`,
      data: {
        sanPham: {
          _id: sanPhamCapNhat._id,
          name: sanPhamCapNhat.name,
          sku: sanPhamCapNhat.sku,
          soLuongTruoc: soLuongTruoc,
          soLuongThayDoi: type === "Import" ? `+${quantity}` : `-${quantity}`,
          soLuongSau: sanPhamCapNhat.quantity,
        },
        logGiaoDich: {
          _id: logGiaoDich[0]._id,
          type: logGiaoDich[0].type,
          quantity: logGiaoDich[0].quantity,
          customerName: logGiaoDich[0].customerName,
          customerId: logGiaoDich[0].customerId,
          createdAt: logGiaoDich[0].createdAt,
        },
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("[Inventory Controller] Lỗi quetMaQR:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xử lý giao dịch kho." });
  }
};

const layLichSuGiaoDich = async (req, res) => {
  try {
    const { productId, userId, customerId, type, limit } = req.query;
    const filter = {};

    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (customerId) filter.customerId = customerId;
    if (type && ["Import", "Export"].includes(type)) filter.type = type;

    const soLuongGiớiHan = parseInt(limit) > 0 ? parseInt(limit) : 100;

    // TỐI ƯU: Chỉ sử dụng 1 lệnh populate lồng nhau duy nhất cho productId
    // Thay toàn bộ phần populate cũ bằng cấu trúc này:
    const danhSachLog = await InventoryLog.find(filter)
      .populate({
        path: "productId",
        select: "name sku location supplierId",
        populate: {
          path: "supplierId",
          model: "Supplier", // Đảm bảo tên Model Supplier khớp với khai báo trong backend
          select: "name", // Chỉ lấy trường tên nhà cung cấp
        },
      })
      .populate("userId", "username role")
      .populate("customerId", "name contactName phone")
      .sort({ createdAt: -1 })
      .limit(soLuongGiớiHan);

    return res.status(200).json({
      success: true,
      message: `Lấy lịch sử giao dịch thành công.`,
      data: danhSachLog,
    });
  } catch (err) {
    console.error("[Inventory Controller] Lỗi layLichSuGiaoDich:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử giao dịch.",
    });
  }
};

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

    const gioVietNam = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const tenFile = `BaoCaoTonKho_${gioVietNam}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${tenFile}"`);
    res.setHeader("Content-Length", buffer.length);

    return res.status(200).send(buffer);
  } catch (err) {
    console.error("[Inventory Controller] Lỗi xuatBaoCaoExcel:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xuất báo cáo Excel." });
  }
};

module.exports = {
  quetMaQR,
  layLichSuGiaoDich,
  xuatBaoCaoExcel,
};
