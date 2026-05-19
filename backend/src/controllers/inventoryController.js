/**
 * Controller xử lý các nghiệp vụ liên quan đến Tồn Kho (Inventory).
 * Bao gồm:
 * - Quét mã QR / SKU để nhập kho hoặc xuất kho.
 * - Tự động gửi email cảnh báo khi sản phẩm sắp hết hàng (qua Nodemailer).
 * - Xuất báo cáo tồn kho ra file Excel (qua thư viện xlsx).
 */
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');

/**
 * Cấu hình transporter của Nodemailer để gửi email.
 * Thông tin SMTP được lấy từ biến môi trường.
 */
const taoTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Gửi email cảnh báo sản phẩm sắp hết hàng tới Admin.
 * Hàm được gọi tự động sau mỗi lần xuất kho (Export).
 *
 * @param {object} sanPham - Object sản phẩm chứa thông tin cảnh báo
 */
const guiEmailCanhBao = async (sanPham) => {
  try {
    const transporter = taoTransporter();

    const mailOptions = {
      from: `"Hệ thống Quản lý Kho" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `⚠️  CẢNH BÁO: Sản phẩm "${sanPham.name}" sắp hết hàng!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">⚠️  Cảnh Báo Sắp Hết Hàng</h2>
          <p>Hệ thống quản lý kho vừa ghi nhận một sản phẩm có số lượng tồn kho thấp hơn mức cảnh báo.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tên sản phẩm</td>
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
              <td style="padding: 10px; border: 1px solid #ddd;">${sanPham.location || 'Chưa có thông tin'}</td>
            </tr>
          </table>
          <p>Vui lòng kiểm tra và tiến hành nhập thêm hàng hóa để tránh tình trạng hết hàng.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Email được gửi tự động từ Hệ thống Quản lý Kho PTIT. Vui lòng không trả lời email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email]  Đã gửi email cảnh báo sắp hết hàng cho sản phẩm: "${sanPham.name}" (SKU: ${sanPham.sku})`);

  } catch (err) {
    // Ghi log lỗi nhưng KHÔNG làm gián đoạn luồng xuất kho.
    console.error(`[Email]  Gửi email cảnh báo thất bại cho sản phẩm "${sanPham.name}":`, err.message);
  }
};

/**
 * POST /api/inventory/scan
 * Xử lý dữ liệu quét mã QR (SKU) từ thiết bị.
 * Thực hiện nhập kho (Import) hoặc xuất kho (Export) cho sản phẩm tương ứng.
 *
 * Body: { sku: string, type: 'Import'|'Export', quantity: number }
 *
 * Logic:
 * - Import: Cộng thêm quantity vào tồn kho hiện tại.
 * - Export: Kiểm tra đủ hàng không → trừ quantity → kiểm tra cảnh báo → gửi mail nếu cần.
 * - Luôn ghi nhận 1 bản ghi InventoryLog.
 */
const quetMaQR = async (req, res) => {
  try {
    const { sku, type, quantity } = req.body;
    const userId = req.user._id;

    // 1. Validate đầu vào.
    if (!sku || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Các trường "sku", "type" và "quantity" là bắt buộc.',
      });
    }

    if (!['Import', 'Export'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Trường "type" phải là "Import" (nhập kho) hoặc "Export" (xuất kho).',
      });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Trường "quantity" phải là số nguyên dương lớn hơn 0.',
      });
    }

    // 2. Tìm sản phẩm theo SKU (đã được schema tự động chuyển thành chữ hoa).
    const sanPham = await Product.findOne({ sku: sku.trim().toUpperCase() });
    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với mã SKU "${sku}". Vui lòng kiểm tra lại mã vạch.`,
      });
    }

    let soLuongTruoc = sanPham.quantity;
    let soLuongSau = soLuongTruoc;

    // 3. Xử lý nhập kho (Import).
    if (type === 'Import') {
      soLuongSau = soLuongTruoc + quantity;
      sanPham.quantity = soLuongSau;
      await sanPham.save();

    // 4. Xử lý xuất kho (Export).
    } else if (type === 'Export') {
      if (soLuongTruoc < quantity) {
        return res.status(400).json({
          success: false,
          message: `Số lượng xuất (${quantity}) vượt quá số lượng tồn kho hiện tại (${soLuongTruoc}). Không thể xuất kho.`,
        });
      }

      soLuongSau = soLuongTruoc - quantity;
      sanPham.quantity = soLuongSau;
      await sanPham.save();

      // 5. Kiểm tra cảnh báo: nếu số lượng sau khi xuất <= minQuantity → gửi email.
      if (soLuongSau <= sanPham.minQuantity) {
        console.log(`[Inventory] ⚠️  Sản phẩm "${sanPham.name}" đã sắp hết hàng. Tiến hành gửi email cảnh báo...`);
        guiEmailCanhBao(sanPham);
      }
    }

    // 6. Ghi nhận lịch sử giao dịch vào bảng InventoryLog.
    const logGiaoDich = await InventoryLog.create({
      productId: sanPham._id,
      userId: userId,
      type: type,
      quantity: quantity,
    });

    // 7. Trả kết quả về cho client.
    return res.status(200).json({
      success: true,
      message: `Giao dịch ${type === 'Import' ? 'nhập kho' : 'xuất kho'} thành công.`,
      data: {
        sanPham: {
          _id: sanPham._id,
          name: sanPham.name,
          sku: sanPham.sku,
          soLuongTruoc: soLuongTruoc,
          soLuongThayDoi: type === 'Import' ? `+${quantity}` : `-${quantity}`,
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
    console.error('[Inventory Controller] Lỗi quetMaQR:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý quét mã QR.',
    });
  }
};

/**
 * GET /api/inventory/logs
 * Lấy lịch sử nhập/xuất kho (InventoryLog).
 * Hỗ trợ lọc theo: ?productId=, ?userId=, ?type= (Import/Export), giới hạn số bản ghi ?limit=.
 * populate productId và userId để hiển thị thông tin chi tiết thay vì chỉ ObjectId.
 */
const layLichSuGiaoDich = async (req, res) => {
  try {
    const { productId, userId, type, limit } = req.query;
    const filter = {};

    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (type && ['Import', 'Export'].includes(type)) filter.type = type;

    const soLuongGiớiHan = parseInt(limit) > 0 ? parseInt(limit) : 100;

    const danhSachLog = await InventoryLog.find(filter)
      .populate('productId', 'name sku location')
      .populate('userId', 'username role')
      .sort({ createdAt: -1 })
      .limit(soLuongGiớiHan);

    return res.status(200).json({
      success: true,
      message: `Lấy lịch sử giao dịch thành công. Tìm thấy ${danhSachLog.length} bản ghi.`,
      data: danhSachLog,
      total: danhSachLog.length,
    });

  } catch (err) {
    console.error('[Inventory Controller] Lỗi layLichSuGiaoDich:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lịch sử giao dịch.',
    });
  }
};

/**
 * GET /api/inventory/export-excel
 * Xuất báo cáo tồn kho hiện tại ra file Excel (.xlsx).
 * Sử dụng thư viện xlsx để tạo workbook và worksheet.
 * Chỉ Admin mới được phép gọi API này.
 *
 * File trả về có các cột: Mã SKU, Tên sản phẩm, Số lượng tồn kho, Hạn mức cảnh báo,
 * Trạng thái tồn kho, Nhà cung cấp, Vị trí lưu trữ, Ngày cập nhật cuối.
 */
const xuatBaoCaoExcel = async (req, res) => {
  try {
    // Lấy toàn bộ sản phẩm kèm thông tin nhà cung cấp.
    const danhSachSanPham = await Product.find({})
      .populate('supplierId', 'name')
      .sort({ createdAt: -1 });

    if (danhSachSanPham.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không có dữ liệu sản phẩm để xuất báo cáo.',
      });
    }

    // Chuẩn bị dữ liệu cho sheet Excel.
    const duLieuExcel = danhSachSanPham.map((sp, index) => {
      let trangThai = 'Còn hàng';
      if (sp.quantity <= 0) {
        trangThai = 'Hết hàng';
      } else if (sp.quantity < sp.minQuantity) {
        trangThai = 'Sắp hết - Cần nhập thêm';
      }

      return {
        'STT': index + 1,
        'Mã SKU': sp.sku,
        'Tên sản phẩm': sp.name,
        'Số lượng tồn kho': sp.quantity,
        'Hạn mức cảnh báo': sp.minQuantity,
        'Trạng thái tồn kho': trangThai,
        'Nhà cung cấp': sp.supplierId ? sp.supplierId.name : 'Không xác định',
        'Vị trí lưu trữ': sp.location || '',
        'Ngày tạo': sp.createdAt ? new Date(sp.createdAt).toLocaleString('vi-VN') : '',
        'Ngày cập nhật cuối': sp.updatedAt ? new Date(sp.updatedAt).toLocaleString('vi-VN') : '',
      };
    });

    // Tạo worksheet từ dữ liệu.
    const worksheet = XLSX.utils.json_to_sheet(duLieuExcel);

    // Tự động điều chỉnh độ rộng cột cho đẹp.
    worksheet['!cols'] = [
      { wch: 5 },   // STT
      { wch: 20 },  // Mã SKU
      { wch: 40 },  // Tên sản phẩm
      { wch: 18 },  // Số lượng tồn kho
      { wch: 18 },  // Hạn mức cảnh báo
      { wch: 25 },  // Trạng thái tồn kho
      { wch: 35 },  // Nhà cung cấp
      { wch: 20 },  // Vị trí lưu trữ
      { wch: 22 },  // Ngày tạo
      { wch: 22 },  // Ngày cập nhật cuối
    ];

    // Tạo workbook và gắn worksheet.
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo tồn kho');

    // Tạo buffer để gửi về client.
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Tạo tên file có dấu thời gian để tránh trùng lặp.
    const thoiGian = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const tenFile = `BaoCaoTonKho_${thoiGian}.xlsx`;

    // Thiết lập header để trình duyệt tải file về.
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${tenFile}"`);
    res.setHeader('Content-Length', buffer.length);

    console.log(`[Inventory]  Đã xuất báo cáo Excel: "${tenFile}" (${danhSachSanPham.length} sản phẩm)`);

    return res.status(200).send(buffer);

  } catch (err) {
    console.error('[Inventory Controller] Lỗi xuatBaoCaoExcel:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xuất báo cáo Excel.',
    });
  }
};

module.exports = {
  quetMaQR,
  layLichSuGiaoDich,
  xuatBaoCaoExcel,
};
